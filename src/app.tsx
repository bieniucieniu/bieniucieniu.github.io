import { Route, Router } from "@solidjs/router";
import { Suspense } from "solid-js";
import Spotlight from "./components/spotlight";
import Home from "./routes";
import NotFound from "./routes/[...404]";
import Experience from "./routes/experience";
import Tiptap from "./routes/tiptap";

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
			<Route path="/experience" component={Experience} />
			<Route path="/tiptap" component={Tiptap} />
			<Route path="*404" component={NotFound} />
		</Router>
	);
}
