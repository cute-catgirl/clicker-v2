<script>
	import upgrades from '$lib/data/upgrades.json';
	import UpgradeButton from '$lib/components/UpgradeButton.svelte';

	let game = $state({
		score: 9999,
		scoreTotal: 0,
		upgradesOwned: {}
	});

	function calculateCost(upgradeKey) {
		const upgrade = upgrades[upgradeKey];
		const count = game.upgradesOwned[upgradeKey] || 0;
		const { base, scaling } = upgrade.cost;

		switch (scaling.type) {
			case 'linear':
				return base + count * scaling.factor;
			case 'exponential':
				return base * Math.pow(scaling.factor, count);
			case 'logarithmic':
				return base + scaling.factor * Math.log10(count + 1);
			default:
				throw new Error(`Unsupported scaling type: ${scaling.type}`);
		}
	}

	function calculateClickPower() {
		let baseClickPower = 1;
		let baseClickMult = 1;
		Object.entries(game.upgradesOwned).forEach(([key, count]) => {
			if (upgrades[key].effect.target === 'clickPowerBase') {
				baseClickPower += upgrades[key].effect.value * count;
			} else if (upgrades[key].effect.target === 'clickPowerMult') {
				baseClickMult += upgrades[key].effect.value * count;
			}
		});
		return baseClickPower * baseClickMult;
	}

	function applyUpgrade(upgradeKey) {
		const cost = calculateCost(upgradeKey);
		const upgrade = upgrades[upgradeKey];
		const count = game.upgradesOwned[upgradeKey] || 0;

		if (game.score >= cost && count < calculateEffectiveLimit(upgradeKey)) {
			game.score -= cost;
			game.upgradesOwned[upgradeKey] = count + 1;
		}
	}

	function click() {
		const clickPower = calculateClickPower();
		game.score += clickPower;
		game.scoreTotal += clickPower;
	}

	function autoclick() {
		let autoClickPower = 0;
		Object.entries(game.upgradesOwned).forEach(([key, count]) => {
			if (upgrades[key].effect.target === 'autoclickPower') {
				autoClickPower += upgrades[key].effect.value * count;
			}
		});
		game.score += autoClickPower;
		game.scoreTotal += autoClickPower;
	}

	function calculateEffectiveLimit(upgradeKey) {
		const baseLimit = upgrades[upgradeKey]?.limit || Infinity;

		if (['click_upgrade', 'autoclicker'].includes(upgradeKey)) {
			const limitBreakCount = game.upgradesOwned['limit_break'] || 0;
			return baseLimit + limitBreakCount;
		}

		return baseLimit;
	}

	function checkUnlockConditions(upgradeKey) {
		const upgrade = upgrades[upgradeKey];
		if (!upgrade || !upgrade.unlockCondition) return true;

		const unlockCondition = upgrade.unlockCondition;

		if (unlockCondition.upgrades) {
			return Object.entries(unlockCondition.upgrades).every(
				([target, requiredCount]) => (game.upgradesOwned[target] || 0) >= requiredCount
			);
		}

		if (unlockCondition.score) {
			return game.scoreTotal >= unlockCondition.score;
		}

		return true;
	}

	setInterval(autoclick, 1000);
</script>

<main class="flex justify-start p-5 gap-2 items-center flex-col m-auto w-screen h-screen">
    <h1 class="text-5xl">{game.score}</h1>
    <button class="flex flex-col items-center border-slate-900 border-2 rounded px-5 py-3 shadow-md active:shadow-inner active:translate-y-0.5 transition-all duration-150" onclick={click}>+{calculateClickPower()}</button>
    <div class="flex items-center p-2 gap-2">
        {#each Object.keys(upgrades) as key}
            {#if checkUnlockConditions(key)}
                <UpgradeButton
                    upgradeKey={key}
                    upgrade={upgrades[key]}
                    {game}
                    {calculateCost}
                    {applyUpgrade}
                    {calculateEffectiveLimit}
                />
            {/if}
        {/each}
    </div>
</main>