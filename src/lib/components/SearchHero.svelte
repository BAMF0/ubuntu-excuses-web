<script lang="ts">
	import { goto } from '$app/navigation';

	let query = $state('');

	function navigate() {
		const trimmed = query.trim();
		if (trimmed) {
			goto(`/sources/${encodeURIComponent(trimmed)}`);
		}
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		navigate();
	}
</script>

<section class="p-strip--hero">
	<div class="row">
		<div class="col-12 p-hero__content">
			<h1 class="p-heading--2">Ubuntu Excuses Explorer</h1>
			<p class="p-hero__tagline">
				Search and explore migration excuses for source packages transitioning to the Ubuntu
				release pocket.
			</p>

			<div class="p-hero__search-row">
				<form class="p-search-box p-hero__search-box" role="search" onsubmit={handleSubmit}>
					<label class="u-off-screen" for="search-input">Search packages</label>
					<input
						type="search"
						id="search-input"
						class="p-search-box__input"
						placeholder="Search source packages…"
						bind:value={query}
						autocomplete="off"
					/>
					<button type="reset" class="p-search-box__reset" onclick={() => (query = '')}>
						<span class="u-off-screen">Clear</span>
					</button>
					<button type="submit" class="p-search-box__button">
						<span class="u-off-screen">Search</span>
					</button>
				</form>
				<button type="button" class="p-button--positive p-hero__search-btn" onclick={navigate}>
					Search
				</button>
			</div>

			<p class="p-hero__links">
				<a href="/blocked">View blocked packages →</a>
			</p>
		</div>
	</div>
</section>

<style lang="scss">
	.p-strip--hero {
		display: flex;
		align-items: center;
		min-height: calc(100vh - 3rem);
		text-align: center;
	}

	.p-strip--hero .row {
		width: 100%;
	}

	.p-hero__content {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.p-hero__tagline {
		color: #666;
		margin-bottom: 1.5rem;
		max-width: 36rem;
		text-align: center;
	}

	.p-hero__search-row {
		display: flex;
		align-items: flex-end;
		gap: 0.5rem;
		width: 100%;
		max-width: 36rem;
	}

	.p-hero__search-box {
		flex: 1;
		min-width: 0;
		margin-bottom: 0;
	}

	.p-hero__search-btn {
		white-space: nowrap;
		flex-shrink: 0;
		margin-bottom: 0;
	}

	.p-hero__links {
		margin-top: 1rem;
		color: #666;
	}
</style>
