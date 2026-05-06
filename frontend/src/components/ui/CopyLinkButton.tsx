import { LinkIcon } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../../lib/utils";
import * as m from "../../paraglide/messages";
import { Button } from "./button";

interface Props {
	shortId: string;
	className?: string;
	text?: boolean;
}

export const CopyLinkButton = ({ shortId, className, text }: Props) => {
	const copyLink = () => {
		const url = `${window.location.origin}/e/${shortId}`;
		const fallback = () => {
			navigator.clipboard?.writeText(url).catch(() => {});
			toast.success(m.copy_link_copied(), { id: "copy-link" });
		};
		if (navigator.share) {
			navigator.share({ url }).catch(fallback);
		} else {
			fallback();
		}
	};

	return (
		<Button size="xs" className={className} onClick={copyLink}>
			<LinkIcon className={cn("size-4", text && "mr-2")} />
			{text ? m.share_link() : ""}
		</Button>
	);
};
