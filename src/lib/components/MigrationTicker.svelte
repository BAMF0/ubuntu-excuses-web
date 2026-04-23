<script lang="ts">
	import type { Source } from '$lib/types.js';

	interface Props {
		packages: Source[];
	}

	const { packages }: Props = $props();

	// Duplicate the list so the loop seam is invisible.
	const items = $derived([...packages, ...packages]);

	// Derive a CSS animation duration proportional to the number of items
	// so speed stays roughly constant regardless of how many packages there are.
	const duration = $derived(`${Math.max(20, packages.length * 3)}s`);
</script>

{#if packages.length > 0}
	<div class="ticker-wrap" aria-label="Packages attempting migration">
		<div class="ticker__track" style="--duration: {duration}; --count: {packages.length}">
			{#each items as pkg, i}
				<a
					class="ticker__item"
					href="/sources/{encodeURIComponent(pkg.source_package)}"
					tabindex="-1"
					aria-hidden={i >= packages.length}
				>
					<span class="ticker__name">{pkg.source_package}</span>
					<span class="ticker__version">{pkg.new_version}</span>
					<span class="ticker__dot" aria-hidden="true">↑</span>
				</a>
			{/each}
		</div>
	</div>
{/if}

<style lang="scss">
	.ticker-wrap {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: #2c2c2c;
		color: #e5e5e5;
		height: 2.25rem;
		overflow: hidden;
		display: flex;
		align-items: center;
		border-top: 1px solid #111;
	}

	.ticker__track {
		display: flex;
		align-items: center;
		gap: 0;
		white-space: nowrap;
		animation: ticker-scroll var(--duration, 60s) linear infinite;
		will-change: transform;

		/* Pause on hover so users can read/click items */
		&:hover {
			animation-play-state: paused;
		}
	}

	@keyframes ticker-scroll {
		0%   { transform: translateX(0); }
		100% { transform: translateX(-50%); }
	}

	.ticker__item {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0 1.5rem;
		color: #e5e5e5;
		text-decoration: none;
		font-size: 0.8rem;
		border-right: 1px solid #444;
		height: 100%;
		transition: background 0.15s;

		&:hover {
			background: #3c3c3c;
			color: #fff;
		}
	}

	.ticker__name {
		font-weight: 600;
		letter-spacing: 0.01em;
	}

	.ticker__version {
		color: #999;
		font-size: 0.75rem;
	}

	.ticker__dot {
		color: #0e8420;
		font-size: 0.7rem;
	}
</style>
