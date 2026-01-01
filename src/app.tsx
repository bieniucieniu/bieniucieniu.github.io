import { Route, Router } from "@solidjs/router";
import { Suspense } from "solid-js";
import Spotlight from "./components/spotlight";
import Home from "./routes";
import NotFound from "./routes/[...404]";

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
			<Route path="/" component={Home} />
			<Route path="*404" component={NotFound} />
		</Router>
	);
}
