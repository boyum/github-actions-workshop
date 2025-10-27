# Lesson 14: Advanced Topics & Further Reading

## Congratulations! 🎉

You've completed the core GitHub Actions workshop! You now know how to:

- Create workflows that build, test, and deploy code
- Use artifacts and outputs to share data between jobs
- Set up branch protection and automated dependency management
- Optimize workflows for speed and efficiency

## What's Next?

Here are advanced topics to explore as you continue your GitHub Actions journey:

---

## 🏠 **Local Development**

### **Act - Run GitHub Actions Locally**

Test workflows on your machine without pushing to GitHub.

- **Documentation**: [nektos/act](https://github.com/nektos/act)
- **Installation**: `brew install act` (macOS) or `choco install act-cli` (Windows)
- **Basic usage**: `act` (runs all workflows) or `act push` (simulate push event)
- **Custom runners**: Use Docker images that match GitHub's environment
- **Secrets**: `act -s GITHUB_TOKEN=your_token` for local testing with secrets

---

## 🔧 **Advanced Workflow Patterns**

### **Reusable Workflows**

Share common workflows across repositories.

- **Docs**: [Reusing workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- **Use case**: Organization-wide CI/CD templates

### **Composite Actions**

Create custom actions combining multiple steps.

- **Docs**:
  [Creating a composite action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)
- **Use case**: Package common setup steps (Node.js + dependencies + caching)

### **Dynamic Matrix Generation**

Build matrices from API calls or file changes.

- **Example**: Generate test matrix from changed files
- **Docs**: [Using a matrix for your jobs](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)

---

## 🛡️ **Security & Enterprise**

### **OpenID Connect (OIDC)**

Keyless authentication to cloud providers.

- **AWS**:
  [Configuring OpenID Connect in Amazon Web Services](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- **Azure**:
  [Use GitHub Actions to connect to Azure](https://docs.microsoft.com/en-us/azure/developer/github/connect-from-azure)
- **GCP**:
  [Enabling keyless authentication from GitHub Actions](https://cloud.google.com/blog/products/identity-security/enabling-keyless-authentication-from-github-actions)

### **Self-Hosted Runners**

Run workflows on your own infrastructure.

- **Docs**:
  [About self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners)
- **Use cases**: Private networks, special hardware, cost optimization

### **Environment Protection Rules**

Manual approvals and deployment gates.

- **Docs**:
  [Using environments for deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)

---

## 🚀 **Custom Actions Development**

### **JavaScript Actions**

Build actions with Node.js.

- **Tutorial**:
  [Creating a JavaScript action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
- **Toolkit**: [@actions/toolkit](https://github.com/actions/toolkit)

### **Docker Actions**

Containerized custom actions.

- **Tutorial**:
  [Creating a Docker container action](https://docs.github.com/en/actions/creating-actions/creating-a-docker-container-action)
- **Use case**: Actions requiring specific runtime environments

---

## 📚 **Learning Resources**

### **Official Documentation**

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [GitHub Actions Toolkit](https://github.com/actions/toolkit)

### **Community Resources**

- [Awesome Actions](https://github.com/sdras/awesome-actions) - Curated list of actions
- [GitHub Actions Community Forum](https://github.community/c/code-to-cloud/github-actions/41)
- [GitHub Blog - Actions Category](https://github.blog/category/product-releases/github-actions/)

### **Advanced Tutorials**

- [GitHub Actions by Example](https://www.actionsbyexample.com/)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

---

## 🛠️ **Tools & Integrations**

### **Development Tools**

- **VS Code Extension**:
  [GitHub Actions](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-github-actions)
- **CLI**: [GitHub CLI](https://cli.github.com/) for managing workflows
- **Linting**: [actionlint](https://github.com/rhysd/actionlint) for workflow validation

### **Monitoring & Observability**

- **Workflow Insights**: Built-in analytics in repository settings
- **Third-party monitoring**: Datadog, New Relic integrations
- **Custom notifications**: Slack, Teams, Discord webhooks

---

## 🎯 **Next Steps**

1. **Practice**: Apply what you've learned to your own projects
2. **Experiment**: Try Act for local development
3. **Contribute**: Share useful actions with the community
4. **Scale**: Explore enterprise patterns as your usage grows

## Questions or Need Help?

- **GitHub Community Discussions**: [github.com/community](https://github.com/community)
- **Stack Overflow**: Tag your questions with `github-actions`
- **GitHub Support**: For enterprise customers

---

**Happy automating!** 🤖✨

Remember: The best way to learn GitHub Actions is to build real workflows for real projects. Start small, iterate, and
gradually add complexity as you become more comfortable with the platform.
