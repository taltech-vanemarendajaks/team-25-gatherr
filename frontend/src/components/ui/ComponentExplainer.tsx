interface Props {
	title: string;
	text: string;
}
export const ComponentExplainer = ({ title, text }: Props) => {
	return (
		<div className="text-left mb-4">
			<h1 className="text-content text-xl">{title}</h1>
			<p className="text-info text-sm">{text}</p>
		</div>
	);
};
