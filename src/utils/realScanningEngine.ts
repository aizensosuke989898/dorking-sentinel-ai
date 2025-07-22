import { ApiKeys } from '@/hooks/useApiKeys';

interface ScanResult {
  type: string;
  url: string;
  context: string;
  riskLevel: number;
  confidence: number;
  explanation: string;
}

interface GitHubSearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: Array<{
    name: string;
    path: string;
    sha: string;
    url: string;
    git_url: string;
    html_url: string;
    text_matches?: Array<{
      object_url: string;
      object_type: string;
      property: string;
      fragment: string;
      matches: Array<{
        text: string;
        indices: number[];
      }>;
    }>;
    repository: {
      id: number;
      name: string;
      full_name: string;
      html_url: string;
      description: string;
      private: boolean;
    };
  }>;
}

interface GoogleSearchResult {
  kind: string;
  url: {
    type: string;
    template: string;
  };
  queries: {
    request: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
  };
  items?: Array<{
    kind: string;
    title: string;
    htmlTitle: string;
    link: string;
    displayLink: string;
    snippet: string;
    htmlSnippet: string;
    cacheId?: string;
    formattedUrl: string;
    htmlFormattedUrl: string;
    pagemap?: any;
  }>;
}

export class RealScanningEngine {
  private apiKeys: ApiKeys;

  constructor(apiKeys: ApiKeys) {
    this.apiKeys = apiKeys;
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
    console.log(`Starting real-time security scan for domain: ${domain}`);
    
    // Validate API keys before scanning
    if (!this.validateApiKeys()) {
      throw new Error('API keys validation failed. Please configure all required keys.');
    }

    const scanId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    let findings: ScanResult[] = [];

    try {
      // Perform parallel GitHub and Google scans
      const [githubResults, googleResults] = await Promise.allSettled([
        this.scanGitHub(domain),
        this.scanGoogle(domain)
      ]);

      if (githubResults.status === 'fulfilled') {
        findings.push(...githubResults.value);
      } else {
        console.error('GitHub scan failed:', githubResults.reason);
        throw new Error(`GitHub scan failed: ${githubResults.reason.message || 'Unknown error'}`);
      }

      if (googleResults.status === 'fulfilled') {
        findings.push(...googleResults.value);
      } else {
        console.error('Google scan failed:', googleResults.reason);
        throw new Error(`Google scan failed: ${googleResults.reason.message || 'Unknown error'}`);
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
      throw error;
    }
  }

  private validateApiKeys(): boolean {
    if (!this.apiKeys.githubToken) {
      throw new Error('GitHub API token is required for scanning');
    }
    if (!this.apiKeys.googleApiKey) {
      throw new Error('Google API key is required for scanning');
    }
    if (!this.apiKeys.googleSearchEngineId) {
      throw new Error('Google Search Engine ID is required for scanning');
    }
    return true;
  }

  private async scanGitHub(domain: string): Promise<ScanResult[]> {
    const findings: ScanResult[] = [];
    
    // GitHub search queries for security vulnerabilities
    const searchQueries = [
      `password+in:file+user:${domain}`,
      `api_key+in:file+user:${domain}`,
      `AWS_SECRET+in:file+user:${domain}`,
      `${domain}+password`,
      `${domain}+API_KEY`,
      `${domain}+secret`,
      `${domain}+token`,
      `"${domain}"+".env"`,
      `"${domain}"+config.json`,
      `"${domain}"+credentials`,
    ];

    for (const query of searchQueries) {
      try {
        const response = await fetch(
          `https://api.github.com/search/code?q=${encodeURIComponent(query)}&per_page=10`,
          {
            headers: {
              'Authorization': `token ${this.apiKeys.githubToken}`,
              'Accept': 'application/vnd.github.v3.text-match+json',
              'User-Agent': 'SecurityScanner/1.0'
            }
          }
        );

        if (response.status === 403) {
          throw new Error('GitHub rate-limited or token invalid');
        }

        if (response.status === 401) {
          throw new Error('GitHub token invalid or unauthorized');
        }

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const data: GitHubSearchResult = await response.json();
        
        if (data.items && data.items.length > 0) {
          for (const item of data.items) {
            const finding = this.processGitHubResult(item, query);
            if (finding) {
              findings.push(finding);
            }
          }
        }

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`GitHub search failed for query "${query}":`, error);
        throw error;
      }
    }

    return findings;
  }

  private async scanGoogle(domain: string): Promise<ScanResult[]> {
    const findings: ScanResult[] = [];
    
    // Google search dorks for security issues
    const searchQueries = [
      `site:${domain} filetype:env`,
      `site:${domain} intext:password`,
      `site:${domain} intext:"api key"`,
      `site:${domain} intext:"secret"`,
      `site:${domain} filetype:sql`,
      `site:${domain} filetype:log`,
      `site:${domain} intext:"config"`,
      `site:${domain} inurl:admin`,
      `site:${domain} filetype:txt password`,
      `site:${domain} "index of"`,
    ];

    for (const query of searchQueries) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${this.apiKeys.googleApiKey}&cx=${this.apiKeys.googleSearchEngineId}`,
          {
            headers: {
              'User-Agent': 'SecurityScanner/1.0'
            }
          }
        );

        if (response.status === 400) {
          throw new Error('Google API blocked scan: Invalid request or API key');
        }

        if (response.status === 403) {
          throw new Error('Google API blocked scan: Quota exceeded or invalid key');
        }

        if (!response.ok) {
          throw new Error(`Google API error: ${response.status} ${response.statusText}`);
        }

        const data: GoogleSearchResult = await response.json();
        
        if (data.items && data.items.length > 0) {
          for (const item of data.items) {
            const finding = this.processGoogleResult(item, query);
            if (finding) {
              findings.push(finding);
            }
          }
        }

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Google search failed for query "${query}":`, error);
        throw error;
      }
    }

    return findings;
  }

  private processGitHubResult(item: any, query: string): ScanResult | null {
    const riskLevel = this.assessGitHubRisk(item, query);
    
    if (riskLevel === 0) return null;

    let context = 'GitHub repository match';
    if (item.text_matches && item.text_matches.length > 0) {
      context = item.text_matches[0].fragment || item.name;
    }

    return {
      type: 'GitHub Security Finding',
      url: item.html_url,
      context: context.substring(0, 100),
      riskLevel,
      confidence: this.calculateConfidence(item, query),
      explanation: this.getGitHubExplanation(item, query, riskLevel)
    };
  }

  private processGoogleResult(item: any, query: string): ScanResult | null {
    const riskLevel = this.assessGoogleRisk(item, query);
    
    if (riskLevel === 0) return null;

    return {
      type: 'Google Search Finding',
      url: item.link,
      context: item.snippet.substring(0, 100),
      riskLevel,
      confidence: this.calculateConfidence(item, query),
      explanation: this.getGoogleExplanation(item, query, riskLevel)
    };
  }

  private assessGitHubRisk(item: any, query: string): number {
    const filename = item.name?.toLowerCase() || '';
    const path = item.path?.toLowerCase() || '';
    const repoName = item.repository?.name?.toLowerCase() || '';

    // High risk indicators
    if (query.includes('password') || query.includes('secret') || query.includes('API_KEY')) {
      if (filename.includes('.env') || path.includes('config') || filename.includes('secret')) {
        return 5; // Critical
      }
      return 4; // High
    }

    // Medium risk indicators
    if (filename.includes('config') || path.includes('admin') || filename.includes('.sql')) {
      return 3; // Medium
    }

    return 2; // Low
  }

  private assessGoogleRisk(item: any, query: string): number {
    const url = item.link?.toLowerCase() || '';
    const snippet = item.snippet?.toLowerCase() || '';
    const title = item.title?.toLowerCase() || '';

    // High risk indicators
    if (query.includes('password') || query.includes('api key') || query.includes('secret')) {
      if (url.includes('.env') || snippet.includes('password') || snippet.includes('api')) {
        return 5; // Critical
      }
      return 4; // High
    }

    // Medium risk indicators
    if (query.includes('admin') || query.includes('config') || query.includes('index of')) {
      return 3; // Medium
    }

    return 2; // Low
  }

  private calculateConfidence(item: any, query: string): number {
    // Simple confidence calculation based on relevance
    let confidence = 0.7;
    
    const text = JSON.stringify(item).toLowerCase();
    const queryTerms = query.toLowerCase().split(' ');
    
    for (const term of queryTerms) {
      if (text.includes(term)) {
        confidence += 0.1;
      }
    }

    return Math.min(confidence, 1.0);
  }

  private getGitHubExplanation(item: any, query: string, riskLevel: number): string {
    const explanations: Record<number, string> = {
      5: 'Critical: Sensitive credentials or secrets found in public GitHub repository. Immediate action required to revoke and rotate these credentials.',
      4: 'High Risk: Potentially sensitive information detected in GitHub repository. Review and secure immediately.',
      3: 'Medium Risk: Configuration or admin files found that may contain sensitive information.',
      2: 'Low Risk: File found that warrants security review.',
      1: 'Info: General security-related finding for review.'
    };
    
    return explanations[riskLevel] || 'Security finding that requires review.';
  }

  private getGoogleExplanation(item: any, query: string, riskLevel: number): string {
    const explanations: Record<number, string> = {
      5: 'Critical: Sensitive information exposed in public search results. Remove or secure the exposed content immediately.',
      4: 'High Risk: Potentially sensitive configuration or credentials found in search results.',
      3: 'Medium Risk: Administrative or configuration files exposed in search results.',
      2: 'Low Risk: Content found that may contain sensitive information.',
      1: 'Info: General security-related content found in search results.'
    };
    
    return explanations[riskLevel] || 'Security finding that requires review.';
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

// Export convenience function for real scanning
export const scanDomainReal = async (domain: string, apiKeys: ApiKeys): Promise<any> => {
  const engine = new RealScanningEngine(apiKeys);
  return await engine.scanDomain(domain);
};