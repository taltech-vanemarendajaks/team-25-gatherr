import { LinkIcon } from "lucide-react";
import toast from "react-hot-toast";
import * as m from "../../paraglide/messages";
import { Button } from "./button";

interface Props {
	shortId: string;
	className?: string;
}

export const CopyLinkButton = ({ shortId, className }: Props) => {
	const copyLink = () => {
		const url = `${window.location.origin}/e/${shortId}`;
		navigator.clipboard.writeText(url);
		toast.success(m.copy_link_copied(), { id: "copy-link" });
	};

	return (
		<Button size="xs" className={className} onClick={copyLink}>
			<LinkIcon className="size-4" />
		</Button>
	);
};
