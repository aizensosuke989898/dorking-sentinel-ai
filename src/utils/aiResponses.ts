
interface ConversationContext {
  previousMessages: Array<{ type: 'user' | 'ai'; content: string }>;
  scanResults?: any;
  userProfile?: any;
}

export class AIResponseGenerator {
  private conversationHistory: Array<{ type: 'user' | 'ai'; content: string; timestamp: Date }> = [];

  generateResponse(userInput: string, context?: ConversationContext): string {
    const input = userInput.toLowerCase().trim();
    
    // Add user message to history
    this.conversationHistory.push({
      type: 'user',
      content: userInput,
      timestamp: new Date()
    });

    // Check for repetitive questions
    if (this.isRepetitiveQuestion(input)) {
      return this.generateVariedResponse(input, context);
    }

    // Generate contextual response
    let response = this.getContextualResponse(input, context);
    
    // Add response to history
    this.conversationHistory.push({
      type: 'ai',
      content: response,
      timestamp: new Date()
    });

    return response;
  }

  private isRepetitiveQuestion(input: string): boolean {
    const recentUserMessages = this.conversationHistory
      .filter(msg => msg.type === 'user')
      .slice(-3)
      .map(msg => msg.content.toLowerCase());

    return recentUserMessages.filter(msg => 
      this.calculateSimilarity(msg, input) > 0.7
    ).length > 1;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private generateVariedResponse(input: string, context?: ConversationContext): string {
    const variations = [
      "I notice you're asking about something similar to what we just discussed. Let me provide additional insights: ",
      "Building on our previous conversation, here's another perspective: ",
      "I see you want to explore this topic further. Here's more detailed information: ",
      "Let me expand on that with some additional context: "
    ];

    const baseResponse = this.getContextualResponse(input, context);
    const variation = variations[Math.floor(Math.random() * variations.length)];
    
    return variation + baseResponse + " Is there a specific aspect you'd like me to focus on?";
  }

  private getContextualResponse(input: string, context?: ConversationContext): string {
    // Greeting and help
    if (this.matchesPattern(input, ['hello', 'hi', 'help', 'start'])) {
      return this.getRandomResponse([
        "Hello! I'm your cybersecurity AI assistant. I can help analyze scan results, explain vulnerabilities, suggest security improvements, and answer questions about cybersecurity best practices. What would you like to know?",
        "Hi there! I specialize in cybersecurity analysis and can help you understand scan findings, implement security measures, and learn about common vulnerabilities. How can I assist you today?",
        "Welcome! I'm here to help with cybersecurity questions, vulnerability analysis, and security recommendations. What specific area would you like to explore?"
      ]);
    }

    // Scan results analysis
    if (this.matchesPattern(input, ['scan', 'result', 'finding', 'vulnerability'])) {
      if (context?.scanResults) {
        return this.analyzeScanResults(context.scanResults, input);
      }
      return this.getRandomResponse([
        "I can help analyze scan results once you've completed a domain scan. The scanner looks for exposed credentials, API keys, database connections, and other security vulnerabilities. Would you like me to explain what each finding type means?",
        "Scan results typically include various types of security findings like exposed secrets, configuration issues, and potential entry points. I can help prioritize findings by risk level and suggest remediation steps. Do you have specific results to review?",
        "When analyzing scan results, I focus on risk level, confidence scores, and potential impact. I can help you understand what each finding means and how to address it. What type of vulnerability are you most concerned about?"
      ]);
    }

    // Security best practices
    if (this.matchesPattern(input, ['secure', 'protect', 'best practice', 'recommendation'])) {
      return this.getRandomResponse([
        "Here are key security practices: 1) Never hardcode secrets in source code - use environment variables or secret management systems. 2) Implement proper access controls and least privilege principles. 3) Keep software updated and use automated security scanning. 4) Use strong, unique passwords and enable 2FA. 5) Regular security audits and penetration testing.",
        "Security best practices include: Use secret management tools like AWS Secrets Manager or HashiCorp Vault, implement proper authentication and authorization, enable logging and monitoring, use HTTPS everywhere, validate all inputs, and follow the principle of defense in depth. What specific area would you like to focus on?",
        "Essential security measures: Secure coding practices, regular dependency updates, proper secret management, network segmentation, incident response planning, and security awareness training. I can provide specific guidance for any of these areas."
      ]);
    }

    // API keys and credentials
    if (this.matchesPattern(input, ['api key', 'credential', 'secret', 'password', 'token'])) {
      return this.getRandomResponse([
        "API keys and credentials should never be hardcoded in source code. Use environment variables, secret management systems like AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault. If credentials are exposed, rotate them immediately and implement proper secret scanning in your CI/CD pipeline.",
        "Credential security involves: 1) Using dedicated secret management tools, 2) Implementing proper access controls, 3) Regular rotation of sensitive credentials, 4) Monitoring for unauthorized access, 5) Using short-lived tokens when possible. Have you found exposed credentials that need immediate attention?",
        "For credential management: Store secrets in encrypted vaults, use IAM roles instead of long-lived keys where possible, implement secret rotation policies, monitor access logs, and use tools like GitLeaks or TruffleHog to prevent accidental commits."
      ]);
    }

    // Database security
    if (this.matchesPattern(input, ['database', 'sql', 'mongodb', 'mysql', 'postgres'])) {
      return this.getRandomResponse([
        "Database security requires multiple layers: Use parameterized queries to prevent SQL injection, implement proper access controls with least privilege, encrypt data at rest and in transit, regular backups with encryption, and never expose database credentials in configuration files.",
        "Key database security practices: Strong authentication, network isolation, regular security patches, audit logging, backup encryption, and proper user privilege management. Connection strings should never be in public repositories or accessible endpoints.",
        "Database protection involves: Secure configuration, regular vulnerability assessments, proper backup procedures, monitoring for suspicious activities, and ensuring compliance with data protection regulations. What specific database concerns do you have?"
      ]);
    }

    // JWT and authentication
    if (this.matchesPattern(input, ['jwt', 'authentication', 'auth', 'session'])) {
      return this.getRandomResponse([
        "JWT security best practices: Use strong, randomly generated secrets for signing, implement short expiration times, use refresh tokens for longer sessions, never expose JWT secrets in client-side code, and consider using asymmetric signing for distributed systems.",
        "Authentication security involves: Strong password policies, multi-factor authentication, secure session management, proper logout procedures, and protection against common attacks like CSRF and session fixation. JWT tokens should be properly validated and have appropriate expiration times.",
        "For JWT implementation: Use established libraries, implement proper token validation, store secrets securely, use HTTPS only, implement token refresh mechanisms, and monitor for suspicious authentication patterns."
      ]);
    }

    // Malicious request blocking
    if (this.matchesPattern(input, ['hack', 'exploit', 'attack', 'break', 'penetrate'])) {
      return "I can only provide information for educational and defensive security purposes. I cannot assist with malicious activities, unauthorized access attempts, or any illegal activities. My purpose is to help improve security, not compromise it. Please use this tool responsibly for legitimate security research and protection.";
    }

    // GitHub security
    if (this.matchesPattern(input, ['github', 'repository', 'repo', 'source code'])) {
      return this.getRandomResponse([
        "GitHub security involves: Enable secret scanning, use branch protection rules, implement proper access controls, regular dependency updates with Dependabot, code review requirements, and never commit sensitive data. Consider using .gitignore and git-secrets tools.",
        "Repository security best practices: Use private repos for sensitive code, implement proper access management, enable security alerts, use signed commits, regular security audits, and proper CI/CD security configurations.",
        "For code repository security: Implement branch protection, require code reviews, use automated security scanning, manage access permissions carefully, and educate team members about secure coding practices."
      ]);
    }

    // Risk assessment
    if (this.matchesPattern(input, ['risk', 'priority', 'critical', 'urgent'])) {
      return this.getRandomResponse([
        "Risk prioritization should consider: Impact (data exposure, financial loss, reputation damage), Likelihood (ease of exploitation, public exposure), and Context (regulatory requirements, business criticality). Address high-impact, high-likelihood issues first.",
        "Security risk assessment involves evaluating: Severity of potential impact, exploitability of the vulnerability, current exposure level, and available mitigations. Critical findings like exposed credentials should be addressed immediately.",
        "Risk-based approach: Categorize findings by risk level, consider business context, implement quick wins first, develop remediation timelines, and establish continuous monitoring for ongoing protection."
      ]);
    }

    // Cloud security
    if (this.matchesPattern(input, ['aws', 'cloud', 'azure', 'gcp', 's3'])) {
      return this.getRandomResponse([
        "Cloud security fundamentals: Implement IAM best practices, use least privilege access, enable logging and monitoring, encrypt data in transit and at rest, regular security assessments, and proper configuration management.",
        "AWS security essentials: Use IAM roles instead of access keys, enable CloudTrail, configure proper S3 bucket policies, use VPCs for network isolation, and implement security groups correctly. Never expose access keys publicly.",
        "Cloud security strategy: Identity and access management, data encryption, network security, compliance monitoring, incident response planning, and regular security configuration reviews."
      ]);
    }

    // Default educational response with variety
    return this.getRandomResponse([
      "That's an interesting cybersecurity question. For comprehensive guidance, I recommend consulting established security frameworks like OWASP Top 10, NIST Cybersecurity Framework, or CIS Controls. Always ensure you're following responsible disclosure practices and only testing systems you own or have explicit permission to assess.",
      "For detailed security guidance on that topic, consider reviewing resources from SANS, OWASP, or NIST. Remember to always follow ethical guidelines and legal requirements when conducting security research or assessments.",
      "That's a valuable security consideration. I'd recommend exploring official security documentation and industry best practices. If you're dealing with a specific vulnerability, ensure you have proper authorization before any testing and follow responsible disclosure guidelines.",
      "Cybersecurity is a complex field with many nuances. For authoritative guidance on that topic, check official security standards and frameworks. Always prioritize ethical practices and legal compliance in any security-related activities."
    ]);
  }

  private matchesPattern(input: string, keywords: string[]): boolean {
    return keywords.some(keyword => input.includes(keyword));
  }

  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private analyzeScanResults(scanResults: any, userInput: string): string {
    const { findings, summary } = scanResults;
    
    if (this.matchesPattern(userInput, ['high', 'critical', 'urgent'])) {
      const highRiskFindings = findings.filter((f: any) => f.riskLevel >= 4);
      if (highRiskFindings.length > 0) {
        return `You have ${highRiskFindings.length} high-risk findings that need immediate attention. The most critical issues include: ${highRiskFindings.slice(0, 2).map((f: any) => f.type).join(', ')}. I recommend addressing these immediately by rotating any exposed credentials and implementing proper secret management.`;
      }
    }

    if (this.matchesPattern(userInput, ['fix', 'remediate', 'solve'])) {
      return `To remediate the findings: 1) Immediately rotate any exposed credentials, 2) Remove sensitive data from public repositories, 3) Implement environment variables for configuration, 4) Set up secret scanning in your CI/CD pipeline, 5) Review and update access controls. Would you like specific guidance for any of these steps?`;
    }

    return `Your scan found ${summary.totalFindings} total findings: ${summary.highRisk} high-risk, ${summary.mediumRisk} medium-risk, and ${summary.lowRisk} low-risk issues. High-risk findings should be addressed immediately, while medium and low-risk items can be scheduled for your next security sprint. Would you like me to explain any specific finding?`;
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}
