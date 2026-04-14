import { FireplaceIcon } from "../icons/FireplaceIcon";
import { UserButton } from "./UserButton";

export const Navbar = () => {
	return (
		<nav className="text-white max-w-lg m-auto">
			<div className="flex flex-row items-center justify-between mt-6 mx-2">
				<FireplaceIcon />
				<span className="font-viking text-5xl">Gatherr</span>
				<UserButton />
			</div>
		</nav>
	);
};
