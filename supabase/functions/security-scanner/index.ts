
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScanRequest {
  domain: string;
  scanType: 'github' | 'google' | 'both';
}

interface ScanResult {
  type: 'GitHub' | 'Google';
  match: string;
  status: 'VULNERABLE' | 'SECURE' | 'LEAK DETECTED' | 'SUSPICIOUS';
  url: string;
  line?: number;
  confidence: number;
}

const GITHUB_SEARCH_PATTERNS = [
  'password',
  'api_key',
  'secret',
  'token',
  'credentials',
  'mysql://',
  'postgres://',
  'mongodb://',
  'AKIA', // AWS access keys
  'sk-', // OpenAI API keys
  'ghp_', // GitHub personal access tokens
];

const GOOGLE_DORKS = [
  'filetype:env',
  'filetype:sql',
  'filetype:yml',
  'filetype:json',
  'intext:password',
  'intext:api_key',
  'intext:"secret"',
  'ext:sql intext:dump',
  'intitle:"index of" intext:".env"',
];

const VULNERABILITY_PATTERNS = [
  {
    pattern: /password\s*[:=]\s*["']([^"']*?)["']/gi,
    type: 'Password',
    getStatus: (match: string) => {
      const value = match.split(/[:=]/)[1]?.replace(/["']/g, '').trim();
      if (!value || value.length < 3 || ['password', '123', 'test', 'admin'].includes(value.toLowerCase())) {
        return 'VULNERABLE';
      }
      return value.length > 8 ? 'SECURE' : 'SUSPICIOUS';
    }
  },
  {
    pattern: /api[_-]?key\s*[:=]\s*["']([^"']*?)["']/gi,
    type: 'API Key',
    getStatus: (match: string) => {
      const value = match.split(/[:=]/)[1]?.replace(/["']/g, '').trim();
      if (!value || value.length < 10 || ['api_key', 'your_key', 'test'].includes(value.toLowerCase())) {
        return 'VULNERABLE';
      }
      return 'LEAK DETECTED';
    }
  },
  {
    pattern: /AKIA[0-9A-Z]{16}/gi,
    type: 'AWS Access Key',
    getStatus: () => 'LEAK DETECTED'
  },
  {
    pattern: /sk-[A-Za-z0-9]{48}/gi,
    type: 'OpenAI API Key',
    getStatus: () => 'LEAK DETECTED'
  },
];

async function scanGitHub(domain: string, githubToken: string): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  ];

  for (const pattern of GITHUB_SEARCH_PATTERNS.slice(0, 5)) { // Limit to prevent rate limiting
    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)); // Random delay
      
      const query = `${pattern} site:${domain} OR ${domain}`;
      const url = `https://api.github.com/search/code?q=${encodeURIComponent(query)}&per_page=10`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
        },
      });

      if (response.status === 403 || response.status === 429) {
        console.log(`Rate limited for pattern: ${pattern}`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Backoff
        continue;
      }

      if (!response.ok) {
        console.error(`GitHub API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        for (const item of data.items.slice(0, 3)) { // Limit results per pattern
          try {
            // Fetch file content
            const contentResponse = await fetch(item.url, {
              headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3.raw',
                'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
              },
            });

            if (contentResponse.ok) {
              const content = await contentResponse.text();
              const fileResults = analyzeContent(content, item.html_url, 'GitHub');
              results.push(...fileResults);
            }
          } catch (error) {
            console.error('Error fetching file content:', error);
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning GitHub for ${pattern}:`, error);
    }
  }

  return results;
}

async function scanGoogle(domain: string, googleApiKey: string, searchEngineId: string): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  ];

  for (const dork of GOOGLE_DORKS.slice(0, 4)) { // Limit to prevent quota exhaustion
    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)); // Random delay
      
      const query = `site:${domain} ${dork}`;
      const url = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
        },
      });

      if (response.status === 429) {
        console.log(`Rate limited for dork: ${dork}`);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Backoff
        continue;
      }

      if (!response.ok) {
        console.error(`Google API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        for (const item of data.items.slice(0, 3)) {
          const snippet = item.snippet || '';
          const title = item.title || '';
          const combinedText = `${title} ${snippet}`;
          
          const fileResults = analyzeContent(combinedText, item.link, 'Google');
          results.push(...fileResults);
        }
      }
    } catch (error) {
      console.error(`Error scanning Google for ${dork}:`, error);
    }
  }

  return results;
}

function analyzeContent(content: string, url: string, type: 'GitHub' | 'Google'): ScanResult[] {
  const results: ScanResult[] = [];
  
  for (const vuln of VULNERABILITY_PATTERNS) {
    const matches = Array.from(content.matchAll(vuln.pattern));
    
    for (const match of matches) {
      if (match[0]) {
        const lineNumber = type === 'GitHub' ? 
          content.substring(0, match.index).split('\n').length : undefined;
        
        results.push({
          type,
          match: sanitizeMatch(match[0]),
          status: vuln.getStatus(match[0]),
          url,
          line: lineNumber,
          confidence: calculateConfidence(match[0], vuln.type)
        });
      }
    }
  }
  
  return results;
}

function sanitizeMatch(match: string): string {
  // Partially mask sensitive data for display
  return match.replace(/([A-Za-z0-9]{4})[A-Za-z0-9]{4,}([A-Za-z0-9]{2})/g, '$1****$2');
}

function calculateConfidence(match: string, type: string): number {
  let confidence = 0.7;
  
  if (type === 'AWS Access Key' && match.includes('AKIA')) confidence = 0.95;
  if (type === 'OpenAI API Key' && match.includes('sk-')) confidence = 0.95;
  if (match.length > 20) confidence += 0.1;
  if (match.includes('test') || match.includes('example')) confidence -= 0.3;
  
  return Math.max(0.1, Math.min(confidence, 1.0));
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get request body
    const { domain, scanType = 'both' }: ScanRequest = await req.json();

    if (!domain) {
      throw new Error('Domain is required');
    }

    // Get API keys from Supabase secrets
    const githubToken = Deno.env.get('GITHUB_TOKEN');
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');

    console.log('Starting security scan for domain:', domain);

    let results: ScanResult[] = [];

    // Perform GitHub scanning
    if ((scanType === 'github' || scanType === 'both') && githubToken) {
      console.log('Scanning GitHub...');
      const githubResults = await scanGitHub(domain, githubToken);
      results.push(...githubResults);
    }

    // Perform Google scanning
    if ((scanType === 'google' || scanType === 'both') && googleApiKey && searchEngineId) {
      console.log('Scanning Google...');
      const googleResults = await scanGoogle(domain, googleApiKey, searchEngineId);
      results.push(...googleResults);
    }

    // If no API keys, return mock data for demonstration
    if (!githubToken && !googleApiKey) {
      results = [
        {
          type: 'GitHub',
          match: 'password="****"',
          status: 'VULNERABLE',
          url: `https://github.com/example/${domain}/blob/main/config.py`,
          line: 21,
          confidence: 0.95
        },
        {
          type: 'Google',
          match: 'api_key=abcd****',
          status: 'LEAK DETECTED',
          url: `https://${domain}/config.env`,
          confidence: 0.87
        }
      ];
    }

    console.log(`Scan completed. Found ${results.length} potential vulnerabilities`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        summary: {
          total: results.length,
          vulnerable: results.filter(r => r.status === 'VULNERABLE').length,
          leaks: results.filter(r => r.status === 'LEAK DETECTED').length,
          suspicious: results.filter(r => r.status === 'SUSPICIOUS').length,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Security scan error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
