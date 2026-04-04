import { UserRound } from "lucide-react";
import { FireplaceIcon } from "../icons/FireplaceIcon";
import { GradientIcon } from "../icons/GradientIcon";

export const Navbar = () => {
	return (
		<nav className="text-white max-w-lg m-auto">
			<div className="flex flex-row items-center justify-between mt-6 mx-2">
				<FireplaceIcon />
				<span className="font-viking text-5xl">Gatherr</span>
				<GradientIcon icon={UserRound} className="size-12" />
			</div>
		</nav>
	);
};
