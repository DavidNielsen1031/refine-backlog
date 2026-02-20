FROM node:22-alpine

# Install the published MCP server package
RUN npm install -g refine-backlog-mcp@1.0.5

# Run as non-root for security
USER node

ENTRYPOINT ["refine-backlog-mcp"]
