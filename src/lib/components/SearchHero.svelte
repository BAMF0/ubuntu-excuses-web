<script lang="ts">
	import { goto } from '$app/navigation';

	let query = $state('');

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const trimmed = query.trim();
		if (trimmed) {
			goto(`/sources/${encodeURIComponent(trimmed)}`);
		}
	}
</script>

<section class="p-strip--hero">
	<div class="row">
		<div class="col-8 col-start-large-3">
			<h1 class="p-heading--2">Ubuntu Excuses Explorer</h1>
			<p>
				Search and explore migration excuses for source packages transitioning to the Ubuntu
				release pocket.
			</p>

			<form class="p-search-box" role="search" onsubmit={handleSubmit}>
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

	.p-strip--hero p {
		color: #666;
		margin-bottom: 1.5rem;
	}
</style>
