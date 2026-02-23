import type { HeartACRendererMemo, ReactForwardRef } from "./types";

type ModuleState = { state: "failed" } | { state: "succeeded"; value: unknown };

/** some webpack modules override `toString` */
function safeToString(value: unknown): string {
	try {
		if (typeof value === "function") {
			return Function.prototype.toString.call(value);
		}
		return String(value);
	} catch {
		return "";
	}
}

function checkFunctionKeywords(obj: unknown, keywords: string[], inverseKeywords: string[] = []): boolean {
	if (typeof obj !== "function") return false;
	const str = safeToString(obj);

	return keywords.every(k => str.includes(k)) && inverseKeywords.every(k => !str.includes(k));
}

function checkEsperantoService(obj: unknown, serviceId: string): boolean {
	if (typeof obj !== "function") return false;
	if (!("SERVICE_ID" in obj)) return false;

	return obj.SERVICE_ID === serviceId;
}

function checkReactMemo(obj: unknown): obj is { type: unknown } {
	if (!obj || typeof obj !== "object") return false;
	if (!("$$typeof" in obj)) return false;
	if (obj["$$typeof"] !== Symbol.for("react.memo")) return false;
	if (!("type" in obj)) return false;

	return true;
}

function checkReactForwardRef(obj: unknown): obj is { render: unknown } {
	if (!obj || typeof obj !== "object") return false;
	if (!("$$typeof" in obj)) return false;
	if (obj["$$typeof"] !== Symbol.for("react.forward_ref")) return false;
	if (!("render" in obj)) return false;

	return true;
}

export class SpotifyModules {
	private static webpack: any | null = null;
	private static require: any | null = null;

	private static modules: unknown[] | null = null;
	private static loadedModules: Record<string, ModuleState> = {};

	private static init() {
		this.webpack = (window as any).webpackChunkclient_web ?? (window as any).webpackChunkopen;
		this.require = this.webpack.push([[Symbol()], {}, (re: any) => re]);

		this.refreshModules();
	}

	public static async loadFiles(files: number[]) {
		if (!this.require) this.init();

		await Promise.allSettled(files.map(f => this.require.e(f)));
		this.refreshModules();
	}

	private static refreshModules() {
		if (!this.require) this.init();

		this.loadedModules = {};

		const cache = Object.keys(this.require.m).map(id => {
			try {
				return this.require(id);
			} catch {
				return undefined;
			}
		});
		this.modules = cache
			.filter(module => typeof module === "object")
			.map(module => {
				try {
					return Object.values(module);
				} catch {}
			})
			.flat();
	}

	private static getValue(cacheKey: string, modFn: () => ModuleState): unknown | null {
		if (!this.require) this.init();
		if (!(cacheKey in this.loadedModules)) this.loadedModules[cacheKey] = modFn();

		const state = this.loadedModules[cacheKey]!;
		if (state.state === "failed") return null;
		if (state.state === "succeeded") return state.value;
	}

	private static getValueFiltered(cacheKey: string, filterFn: (m: unknown) => unknown): unknown | null {
		return this.getValue(cacheKey, () => {
			const candidates = this.modules!.filter(filterFn);
			const candidatesDedup = [...new Set(candidates)];

			if (candidatesDedup.length === 1) {
				return {
					state: "succeeded",
					value: candidatesDedup[0]
				};
			} else {
				return {
					state: "failed"
				};
			}
		});
	}

	public static getMetadataService(): unknown | null {
		return this.getValueFiltered("metadataService", m =>
			checkEsperantoService(m, "spotify.mdata_esperanto.proto.MetadataService")
		);
	}

	public static getOfflinePlayableCache(): unknown | null {
		return this.getValueFiltered("offlinePlayableCache", m =>
			checkEsperantoService(m, "spotify.offline_playable_cache_esperanto.proto.OfflinePlayableCache")
		);
	}

	public static getCreateTransport(): unknown | null {
		return this.getValueFiltered("createTransport", m =>
			checkFunctionKeywords(m, ["executeEsperantoCall", "cancelEsperantoCall"])
		);
	}

	public static getTrackList(): unknown | null {
		return this.getValueFiltered(
			"trackList",
			m =>
				checkReactMemo(m) &&
				checkFunctionKeywords(m.type, ["tracks", "nrTracks", "fetchTracks", "itemsCache", "initialItems"])
		);
	}

	public static getTrackListItem(): unknown | null {
		return this.getValueFiltered(
			"trackListItem",
			m =>
				checkReactMemo(m) &&
				checkFunctionKeywords(m.type, ["displayedColumns", "albumOrShow", "associatedAudioUri"])
		);
	}

	public static getCardRenderer(): ReactForwardRef | null {
		return this.getValueFiltered(
			"cardRenderer",
			m => checkReactForwardRef(m) && checkFunctionKeywords(m.render, ["card-title-", "card-subtitle-"])
		) as ReactForwardRef | null;
	}

	public static getStyleSheetManager(): unknown | null {
		return this.getValueFiltered("styleSheetManager", m =>
			checkFunctionKeywords(m, [
				"stylisPlugins",
				"reconstructWithOptions",
				"disableCSSOMInjection",
				"disableVendorPrefixes"
			])
		);
	}

	public static getHeartRenderer(): HeartACRendererMemo | null {
		return this.getValueFiltered(
			"heartRenderer",
			m =>
				checkReactMemo(m) &&
				checkFunctionKeywords(m.type, ["remove-from-library", "add-to-library", "className"], ["isEpisode"])
		) as HeartACRendererMemo | null;
	}

	public static getAlignedCurationRenderer(): HeartACRendererMemo | null {
		return this.getValueFiltered(
			"alignedCurationRenderer",
			m =>
				checkReactMemo(m) &&
				checkFunctionKeywords(m.type, [
					"defaultCurationContextUri",
					"web-player.aligned-curation",
					"isCurated",
					"default-curation"
				])
		) as HeartACRendererMemo | null;
	}
}
