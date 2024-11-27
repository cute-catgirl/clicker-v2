<script>
	import { onMount } from 'svelte';
	import { offset, flip, shift } from 'svelte-floating-ui/dom';
	import { createFloatingActions } from 'svelte-floating-ui';
	import { writable } from 'svelte/store';
	import { arrow } from 'svelte-floating-ui';

	let { upgradeKey, upgrade, game, calculateCost, applyUpgrade, calculateEffectiveLimit } =
		$props();

	const arrowRef = writable(null);
	const [floatingRef, floatingContent, update] = createFloatingActions({
		strategy: 'absolute',
		placement: 'top',
		middleware: [arrow({ element: arrowRef })],
		onComputed({ placement, middlewareData }) {
			const { x, y } = middlewareData.arrow;
			const staticSide = {
				top: 'bottom',
				right: 'left',
				bottom: 'top',
				left: 'right'
			}[placement.split('-')[0]];

			Object.assign($arrowRef.style, {
				left: x != null ? `${x}px` : '',
				top: y != null ? `${y}px` : '',
				[staticSide]: '-4px'
			});
		}
	});

	let count = $derived(game.upgradesOwned[upgradeKey] || 0);

	let limit = $derived(calculateEffectiveLimit(upgradeKey));
	let canPurchase = $derived(count < limit);

	let showTooltip = $state(false);
</script>

<button
	onmouseenter={() => (showTooltip = true)}
	onmouseleave={() => (showTooltip = false)}
	class="flex flex-col items-center rounded border-2 border-slate-900 p-2 shadow-md transition-all duration-150 active:translate-y-0.5 active:shadow-inner"
	onclick={() => applyUpgrade(upgradeKey)}
	disabled={!canPurchase}
	use:floatingRef
>
	<div class="font-bold">{upgrade.name}</div>
	{#if canPurchase}
		<div class="font-medium">{Math.ceil(calculateCost(upgradeKey))} points</div>
	{/if}
	{#if upgrade.limit}
		<div class="font-normal">{count}/{limit}</div>
	{/if}
</button>

{#if showTooltip}
	<div class="absolute rounded bg-slate-200 p-2 shadow-md z-10" use:floatingContent>
		{upgrade.description}
		<div class="absolute w-8 h-8 bg-slate-200 rotate-45 -z-10" bind:this={$arrowRef}></div>
	</div>
{/if}
