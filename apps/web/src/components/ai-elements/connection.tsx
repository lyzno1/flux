import type { ConnectionLineComponent } from "@xyflow/react";

const HALF = 0.5;

export const Connection: ConnectionLineComponent = ({ fromX, fromY, toX, toY }) => (
	<g>
		<path
			className="animated fill-none stroke-1 stroke-ring"
			d={`M${fromX},${fromY} C ${fromX + (toX - fromX) * HALF},${fromY} ${fromX + (toX - fromX) * HALF},${toY} ${toX},${toY}`}
		/>
		<circle className="fill-background stroke-1 stroke-ring" cx={toX} cy={toY} r={3} />
	</g>
);
