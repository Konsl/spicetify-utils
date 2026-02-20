import React from "react";

export type ReactForwardRef = {
	render: (...args: any[]) => React.JSX.Element;
};

export type HeartACRenderer = (params: { uri: string; className: string; onClick: any; size: string }) => any;
export type HeartACRendererMemo = { type: HeartACRenderer };
