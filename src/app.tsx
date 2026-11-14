import { Route, Router } from "@solidjs/router";
import { lazy, Suspense } from "solid-js";
import Layout from "@/components/layout";
import Home from "@/routes";
import NotFound from "@/routes/[...404]";
import Experience from "@/routes/experience";
import Projects from "@/routes/projects";

const Libs = lazy(() => import("@/routes/libs"));

export default function App() {
	return (
		<Router
			root={(props) => (
				<Layout>
					<Suspense>{props.children}</Suspense>
				</Layout>
			)}
		>
			<Route path="/" component={Home} />
			<Route path="/experience" component={Experience} />
			<Route path="/projects" component={Projects} />
			<Route path="/libs" component={Libs} />
			<Route path="*404" component={NotFound} />
		</Router>
	);
}
