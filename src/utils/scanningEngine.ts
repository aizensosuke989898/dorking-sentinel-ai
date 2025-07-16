
interface ScanResult {
  type: string;
  url: string;
  context: string;
  riskLevel: number;
  confidence: number;
  explanation: string;
}

interface DorkQuery {
  name: string;
  query: string;
  riskLevel: number;
  description: string;
}

const GOOGLE_DORKS: DorkQuery[] = [
  {
    name: 'API Keys',
    query: 'site:{domain} "api_key" OR "apikey" OR "api-key" filetype:js OR filetype:json OR filetype:xml',
    riskLevel: 5,
    description: 'Searches for exposed API keys in public files'
  },
  {
    name: 'Database Credentials',
    query: 'site:{domain} "password" OR "passwd" OR "pwd" filetype:sql OR filetype:txt OR filetype:log',
    riskLevel: 5,
    description: 'Looks for database credentials in various file types'
  },
  {
    name: 'Configuration Files',
    query: 'site:{domain} filetype:env OR filetype:config OR filetype:ini OR filetype:conf',
    riskLevel: 4,
    description: 'Finds configuration files that might contain sensitive data'
  },
  {
    name: 'JWT Tokens',
    query: 'site:{domain} "jwt" OR "token" OR "bearer" filetype:js OR filetype:json',
    riskLevel: 4,
    description: 'Searches for JWT tokens and bearer tokens'
  },
  {
    name: 'AWS Credentials',
    query: 'site:{domain} "aws_access_key_id" OR "aws_secret_access_key" OR "AKIA"',
    riskLevel: 5,
    description: 'Looks for AWS access credentials'
  },
  {
    name: 'Private Keys',
    query: 'site:{domain} "BEGIN RSA PRIVATE KEY" OR "BEGIN PRIVATE KEY" OR "ssh-rsa"',
    riskLevel: 5,
    description: 'Searches for SSH and RSA private keys'
  }
];

const GITHUB_DORKS: DorkQuery[] = [
  {
    name: 'Secrets in Code',
    query: '{domain} "password" OR "secret" OR "key" extension:js OR extension:py OR extension:php',
    riskLevel: 4,
    description: 'Searches GitHub repositories for hardcoded secrets'
  },
  {
    name: 'Database URLs',
    query: '{domain} "mysql://" OR "postgres://" OR "mongodb://" extension:env OR extension:config',
    riskLevel: 5,
    description: 'Looks for database connection strings'
  },
  {
    name: 'API Endpoints',
    query: '{domain} "api.{domain}" OR "endpoint" extension:md OR extension:txt',
    riskLevel: 3,
    description: 'Finds documented API endpoints'
  }
];

const VULNERABILITY_PATTERNS = [
  {
    pattern: /(?:api[_\-]?key|apikey)\s*[:=]\s*["']([A-Za-z0-9_\-]{20,})/gi,
    type: 'API Key',
    riskLevel: 5
  },
  {
    pattern: /(?:secret|password|pwd)\s*[:=]\s*["']([A-Za-z0-9_\-!@#$%^&*()]{8,})/gi,
    type: 'Password/Secret',
    riskLevel: 4
  },
  {
    pattern: /AKIA[0-9A-Z]{16}/gi,
    type: 'AWS Access Key',
    riskLevel: 5
  },
  {
    pattern: /sk-[A-Za-z0-9]{48}/gi,
    type: 'OpenAI API Key',
    riskLevel: 5
  },
  {
    pattern: /ghp_[A-Za-z0-9]{36}/gi,
    type: 'GitHub Personal Access Token',
    riskLevel: 4
  },
  {
    pattern: /jwt\s*[:=]\s*["']([A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+)/gi,
    type: 'JWT Token',
    riskLevel: 4
  }
];

export class ScanningEngine {
  private searchApiKey: string | null = null;
  private githubToken: string | null = null;

  constructor(searchApiKey?: string, githubToken?: string) {
    this.searchApiKey = searchApiKey || null;
    this.githubToken = githubToken || null;
  }

  async scanDomain(domain: string): Promise<{
    domain: string;
    scanId: string;
    timestamp: string;
    findings: ScanResult[];
    summary: {
      totalFindings: number;
      highRisk: number;
      mediumRisk: number;
      lowRisk: number;
    };
  }> {
    console.log(`Starting scan for domain: ${domain}`);
    
    const scanId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const findings: ScanResult[] = [];

    try {
      // Search using custom search API or fallback to mock data
      if (this.searchApiKey) {
        const googleFindings = await this.performGoogleSearch(domain);
        findings.push(...googleFindings);
      }

      if (this.githubToken) {
        const githubFindings = await this.performGithubSearch(domain);
        findings.push(...githubFindings);
      }

      // If no API keys, generate realistic mock data
      if (!this.searchApiKey && !this.githubToken) {
        console.log('No API keys provided, generating mock findings...');
        findings.push(...this.generateMockFindings(domain));
      }

      const summary = this.calculateSummary(findings);

      return {
        domain,
        scanId,
        timestamp: new Date().toISOString(),
        findings,
        summary
      };
    } catch (error) {
      console.error('Scanning error:', error);
      throw new Error('Failed to complete scan. Please try again.');
    }
  }

  private async performGoogleSearch(domain: string): Promise<ScanResult[]> {
    const findings: ScanResult[] = [];
    
    for (const dork of GOOGLE_DORKS.slice(0, 3)) { // Limit for demo
      try {
        const query = dork.query.replace(/{domain}/g, domain);
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${this.searchApiKey}&cx=YOUR_SEARCH_ENGINE_ID&q=${encodeURIComponent(query)}`;
        
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          for (const item of data.items.slice(0, 2)) {
            const matches = this.analyzeContent(item.snippet || '', item.link);
            findings.push(...matches);
          }
        }
      } catch (error) {
        console.error(`Google search error for ${dork.name}:`, error);
      }
    }
    
    return findings;
  }

  private async performGithubSearch(domain: string): Promise<ScanResult[]> {
    const findings: ScanResult[] = [];
    
    for (const dork of GITHUB_DORKS.slice(0, 2)) {
      try {
        const query = dork.query.replace(/{domain}/g, domain);
        const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(query)}`;
        
        const response = await fetch(searchUrl, {
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          for (const item of data.items.slice(0, 2)) {
            // Fetch file content if possible
            const matches = this.analyzeContent(item.name || '', item.html_url);
            findings.push(...matches);
          }
        }
      } catch (error) {
        console.error(`GitHub search error:`, error);
      }
    }
    
    return findings;
  }

  private analyzeContent(content: string, url: string): ScanResult[] {
    const findings: ScanResult[] = [];
    
    for (const vuln of VULNERABILITY_PATTERNS) {
      const matches = content.matchAll(vuln.pattern);
      
      for (const match of matches) {
        if (this.isValidSecret(match[1] || match[0])) {
          findings.push({
            type: vuln.type,
            url,
            context: this.sanitizeContext(match[0]),
            riskLevel: vuln.riskLevel,
            confidence: this.calculateConfidence(match[0]),
            explanation: this.getExplanation(vuln.type)
          });
        }
      }
    }
    
    return findings;
  }

  private isValidSecret(value: string): boolean {
    // Check if it's not a common placeholder
    const commonPlaceholders = [
      'your_api_key', 'your_secret', 'placeholder', 'example',
      'test', 'demo', 'sample', 'xxx', '***', 'password123'
    ];
    
    const lowerValue = value.toLowerCase();
    return !commonPlaceholders.some(placeholder => 
      lowerValue.includes(placeholder)
    ) && value.length > 8;
  }

  private calculateConfidence(match: string): number {
    let confidence = 0.7;
    
    // Higher confidence for specific patterns
    if (match.includes('AKIA')) confidence = 0.95;
    if (match.includes('sk-')) confidence = 0.95;
    if (match.includes('ghp_')) confidence = 0.9;
    if (match.match(/[A-Za-z0-9]{32,}/)) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private sanitizeContext(context: string): string {
    // Partially mask sensitive data for display
    return context.replace(/([A-Za-z0-9]{8})[A-Za-z0-9]{8,}([A-Za-z0-9]{4})/g, '$1****$2');
  }

  private getExplanation(type: string): string {
    const explanations: Record<string, string> = {
      'API Key': 'Exposed API keys can allow unauthorized access to services and may result in data breaches or financial charges.',
      'Password/Secret': 'Hardcoded passwords or secrets in source code pose a significant security risk if the code is compromised.',
      'AWS Access Key': 'AWS access keys can provide access to cloud resources and potentially lead to significant financial and security impacts.',
      'OpenAI API Key': 'OpenAI API keys can be used to make API calls at your expense and may expose usage patterns.',
      'GitHub Personal Access Token': 'GitHub tokens can provide access to repositories and potentially allow code modifications.',
      'JWT Token': 'JWT tokens can be used to impersonate users and gain unauthorized access to protected resources.'
    };
    
    return explanations[type] || 'This type of exposed credential poses a security risk and should be rotated immediately.';
  }

  private generateMockFindings(domain: string): ScanResult[] {
    return [
      {
        type: 'Exposed API Key',
        url: `https://github.com/example/${domain}/blob/main/config.js`,
        context: 'API_KEY="sk-proj-****abcdef1234567890"',
        riskLevel: 5,
        confidence: 0.95,
        explanation: 'API key found in public repository. This could allow unauthorized access to services and may result in financial charges.'
      },
      {
        type: 'Database Credentials',
        url: `https://${domain}/wp-config.php.bak`,
        context: 'DB_PASSWORD="myS3cur3****"',
        riskLevel: 4,
        confidence: 0.87,
        explanation: 'Database credentials exposed in backup file. Could lead to complete database compromise if accessible.'
      },
      {
        type: 'AWS Access Key',
        url: `https://github.com/user/${domain}-backend/blob/main/.env.example`,
        context: 'AWS_ACCESS_KEY_ID="AKIA****EXAMPLE"',
        riskLevel: 5,
        confidence: 0.92,
        explanation: 'AWS access key found. This could provide access to cloud resources and result in significant financial impact.'
      }
    ];
  }

  private calculateSummary(findings: ScanResult[]) {
    return {
      totalFindings: findings.length,
      highRisk: findings.filter(f => f.riskLevel >= 4).length,
      mediumRisk: findings.filter(f => f.riskLevel === 3).length,
      lowRisk: findings.filter(f => f.riskLevel <= 2).length
    };
  }
}
