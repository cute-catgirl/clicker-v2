<script>
    let { upgradeKey, upgrade, game, calculateCost, applyUpgrade, calculateEffectiveLimit } = $props();

    let count = $derived(game.upgradesOwned[upgradeKey] || 0);

    let limit = $derived(calculateEffectiveLimit(upgradeKey));
    let canPurchase = $derived(count < limit);
</script>

<button class="flex flex-col items-center border-slate-900 border-2 rounded p-2 shadow-md active:shadow-inner active:translate-y-0.5 transition-all duration-150" onclick={() => applyUpgrade(upgradeKey)} disabled={!canPurchase}>
    <div class="font-bold">{upgrade.name}</div>
    {#if canPurchase}
        <div class="font-medium">{Math.ceil(calculateCost(upgradeKey))} points</div>
    {/if}
    {#if upgrade.limit}
        <div class="font-normal">{count}/{limit}</div>
    {/if}
</button>