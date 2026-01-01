import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import Spotlight from "./components/spotlight";

export default function App() {
	return (
		<Router
			root={(props) => (
				<>
					<Spotlight />
					<Suspense>{props.children}</Suspense>
				</>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
