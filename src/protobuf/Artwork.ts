import { PBMessage, make, PBRepeated, PBEnum, PBBytes, PBInt32 } from "./defs";

export enum Size {
	DEFAULT = 0,
	SMALL = 1,
	LARGE = 2,
	XLARGE = 3
}

const PBSize = PBEnum({
	0: Size.DEFAULT,
	1: Size.SMALL,
	2: Size.LARGE,
	3: Size.XLARGE
});

export const Image = PBMessage({
	fileId: make(1, PBBytes),
	size: make(2, PBSize),
	width: make(3, PBInt32),
	height: make(4, PBInt32)
});

export const ArtworkTrait = PBMessage({
	images: make(1, PBRepeated(Image))
});

export const CoverImage = ArtworkTrait;
