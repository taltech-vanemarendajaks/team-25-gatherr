import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/e/$shortId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { shortId } = Route.useParams();

	return <p className="text-lg text-center">Hello {shortId}</p>;
}
