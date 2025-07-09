/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { ApiFetchClient, IApiDataResponse, IApiUser, OAuthHelper } from "@eway-crm/connector";

const CLIENT_ID = "eway-crm-oauth-demo";

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const redirectUrl = url.protocol + "//" + url.host;
		let ws = url.searchParams.get("ws_url");
		let code = url.searchParams.get("code");

		if (url.pathname === "/favicon.ico") {
			return Response.redirect("https://www.eway-crm.com/favicon.ico", 302);
		}

		// User returned from authorization
		if (code && ws) {
			try {
				if (!env.CLIENT_SECRET) {
					throw new Error("CLIENT_SECRET is not set in environment variables.");
				}

				// Replace code with refresh_token and access_token by calling token endpoint
				const tokenData = await ApiFetchClient.getTokenData(ws, code, redirectUrl, CLIENT_ID, env.CLIENT_SECRET);

				// Initialize API client and login to create session
				const apiClient = new ApiFetchClient(`${CLIENT_ID}-v1.0`, tokenData.access_token);
				await apiClient.login();

				const userName = apiClient.getUserName();
				const users = await apiClient.callMethod('GetUsers', { }) as IApiDataResponse<IApiUser>;

				// Logout session
				await apiClient.logout();

				return new Response(`Successfully logged in as ${userName}. There is ${users.Data.length} users in your system. Your refresh token is ${tokenData.refresh_token}.`);
			}
			catch (error) {
				return new Response(`${error instanceof Error ? error.message : String(error)}`, { status: 400 });
			}
		}

		// Redirect user to authorization
		const authorizationUrl = OAuthHelper.createAuthorizeUrl(CLIENT_ID, [ "api", "offline_access" ], redirectUrl, undefined, undefined, undefined, undefined, ws ?? undefined);
		return Response.redirect(authorizationUrl, 302);
	},
} satisfies ExportedHandler<Env>;
