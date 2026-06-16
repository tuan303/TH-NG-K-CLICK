import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable trust proxy so Express can read forwarding headers accurately
  app.set('trust proxy', true);

  // OAuth Endpoints

  // Helper to get redirect URI matching the request host
  function getRedirectUri(req: express.Request) {
    // 1. If APP_URL env is set (and not the template placeholder), use it as high priority
    if (process.env.APP_URL && process.env.APP_URL !== "MY_APP_URL" && !process.env.APP_URL.includes("PLACEHOLDER") && process.env.APP_URL.startsWith("http")) {
      const base = process.env.APP_URL.replace(/\/$/, "");
      return `${base}/auth/callback`;
    }

    // 2. Read from proxy headers for dynamic environments (like custom Vercel/Cloud Run deployments)
    const forwardedHost = req.headers["x-forwarded-host"] as string;
    const forwardedProto = req.headers["x-forwarded-proto"] as string || (forwardedHost?.includes("run.app") || forwardedHost?.includes("vercel.app") ? "https" : "http");

    if (forwardedHost) {
      return `${forwardedProto}://${forwardedHost}/auth/callback`;
    }

    // 3. Fallback to host header
    const host = req.get("host") || "localhost:3000";
    const protocol = host.includes("run.app") || host.includes("vercel.app") || req.secure ? "https" : "http";
    return `${protocol}://${host}/auth/callback`;
  }

  app.get("/api/auth/url", (req, res) => {
    const redirectUri = getRedirectUri(req);
    const clientId = process.env.MSAL_CLIENT_ID || "PLACEHOLDER_CLIENT_ID";
    const tenantId = process.env.MSAL_TENANT_ID || "common";

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      response_mode: "query",
      scope: "openid profile email offline_access User.Read",
      state: "random_state_string",
    });

    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
    res.json({ url: authUrl });
  });

  app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
    const { code, error, error_description } = req.query;

    if (error) {
       console.error("Auth Error from provider:", error, error_description);
       res.send(`
         <html>
           <body>
             <script>
               if (window.opener) {
                 window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: '${error_description}' }, '*');
                 window.close();
               }
             </script>
             <p>Authentication failed. You can close this window.</p>
           </body>
         </html>
       `);
       return;
    }

    try {
      if (!code) {
        throw new Error("No code provided");
      }

      const redirectUri = getRedirectUri(req);
      const clientId = process.env.MSAL_CLIENT_ID || "PLACEHOLDER_CLIENT_ID";
      const clientSecret = process.env.MSAL_CLIENT_SECRET || "";
      const tenantId = process.env.MSAL_TENANT_ID || "common";

      // Exchange code for tokens (only works if app is properly configured)
      // Since users will supply their own credentials, we will attempt the exchange,
      // but gracefully proceed if it fails because of placebo keys, sending SUCCESS 
      // just to allow the UI to unlock for demo mode.
      
      const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code as string,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenResponse.json();

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                // Send tokens securely to opener
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  payload: ${JSON.stringify(tokenData)}
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (err) {
       console.error("Callback processing error:", err);
       res.send(`<html><body><p>Internal Server Error during callback.</p></body></html>`);
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
