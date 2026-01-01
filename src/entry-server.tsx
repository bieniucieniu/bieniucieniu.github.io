// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
	<StartServer
		document={({ assets, children, scripts }) => (
			<html class="scroll-smooth" lang="en">
				<head>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<link rel="icon" href="/favicon.ico" />
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link
						rel="preconnect"
						href="https://fonts.gstatic.com"
						crossorigin="anonymous"
					/>
					<link
						href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
						rel="stylesheet"
					/>
					{assets}
				</head>
				<body>
					<div
						class="relative min-h-screen bg-slate-900 text-slate-200"
						id="app"
					>
						{children}
					</div>
					{scripts}
				</body>
			</html>
		)}
	/>
));
