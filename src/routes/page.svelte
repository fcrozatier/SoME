<script lang="ts">
	import { resultsAvailable, competitionStarted, voteOpen, phaseOpen } from '$lib/utils';
	import Time from '$lib/components/Time.svelte';
	import type { ActionData, PageData } from './$types';
	import { clickOutside } from '$lib/actions';
	import { enhance } from '$app/forms';
	import { COMPETITION_FULL_NAME, COMPETITION_SHORT_NAME } from '$lib/config';
	import {
		PUBLIC_REGISTRATION_END,
		PUBLIC_REGISTRATION_START,
		PUBLIC_RESULTS_AVAILABLE,
		PUBLIC_VOTE_END,
		PUBLIC_VOTE_START
	} from '$env/static/public';
	import Icon from '../lib/components/Icon.svelte';

	const phases = [
		{
			title: 'Join the competition as a participant or judge',
			description:
				'Participants all work on their projects. Most of the activity during this phase happens on <a href="https://discord.gg/WZvZMVsXXR" target="_blank">Discord</a>, where many people share partial progress, find collaborators, and ask questions.',
			isOpen: phaseOpen(PUBLIC_REGISTRATION_START, PUBLIC_VOTE_END),
			dates: [PUBLIC_REGISTRATION_START, PUBLIC_REGISTRATION_END]
		},
		{
			title: 'Vote for the best contributions',
			description:
				"Peer review! Everyone, whether or not they've submitted an entry, can participate. You'll be successively shown two entries and asked to vote on which is best and to optionally provide feedback (it's actually a ton of fun). In many ways, this is the heart of the event, and in past years this phase has been what jump-started meaningful exposure for many entries.",
			isOpen: voteOpen(),
			dates: [PUBLIC_VOTE_START, PUBLIC_VOTE_END]
		},
		{
			title: 'Results and feedback',
			description:
				'A selection of judges drawn from the math communication community will select winners and honorable mentions from among other top 100 surfaced in the peer review. Winners will be featured in a 3blue1brown video, and awarded $1,000 each, along with the coveted golden pi creature.',
			isOpen: resultsAvailable(),
			dates: [PUBLIC_RESULTS_AVAILABLE]
		}
	];

	const winners = [
		{
			title: 'Title',
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi laudantium odit numquam cum consequuntur quis nihil quod in alias quas vel porro, nemo voluptatum illo unde? Reiciendis corporis necessitatibus cupiditate. Eveniet, dicta iste? Aut suscipit maxime ut vero ad explicabo voluptate, architecto repellat ab. Atque quia neque commodi magnam perspiciatis possimus, quaerat minima optio deserunt quisquam, fuga recusandae quos pariatur illum necessitatibus qui quod velit quasi modi eligendi. Aperiam ad neque voluptas nam nihil ipsa tempora fugiat, soluta, aliquam exercitationem aspernatur ullam deserunt minima non! Possimus nisi quam, explicabo, nam numquam, culpa ad a temporibus amet praesentium quas? Deleniti ab saepe debitis rerum quis, vel distinctio, fuga necessitatibus quisquam iste vero, corporis modi ut nam assumenda cum dolore dolorum esse dicta quasi tempore rem. Esse ea modi commodi animi, eligendi, voluptate, dolorem eaque et iure suscipit eos veniam fugit necessitatibus harum voluptas. Harum omnis unde perferendis suscipit commodi accusamus nulla a labore, esse distinctio consectetur repellat vel similique? Sit nisi ex voluptates sint aut atque, eligendi nam iure provident aliquam nobis amet quae sapiente saepe ullam, asperiores eum fugiat vitae iste. Nostrum labore corporis consectetur, dicta esse odio natus cum rem consequuntur, voluptates, hic nesciunt itaque pariatur enim reprehenderit beatae expedita velit quaerat tempora molestias facere fuga deleniti odit maiores! Amet nihil repellendus molestiae dolores tempora doloremque rerum a voluptas quod numquam earum velit quidem odio exercitationem possimus minus quaerat minima asperiores deleniti, ipsum accusantium ipsam, ducimus tempore. Temporibus rem incidunt architecto voluptas expedita quis praesentium rerum magni illo eius, dolorem doloribus totam fugit placeat, nisi iure doloremque inventore optio laboriosam in saepe obcaecati? Debitis deleniti doloremque similique distinctio incidunt perspiciatis delectus cumque nulla eius optio natus nostrum fugiat laboriosam nam veritatis, iusto et aliquam corporis illum iure officiis. Hic fuga ex laborum? Fuga tenetur iusto a consequuntur? Voluptatem ab tempora perferendis quas enim aliquam corporis tenetur sit, eligendi necessitatibus nostrum, quae hic adipisci ad voluptatibus aut. Repellendus dolorem natus, omnis error cum sapiente ullam asperiores velit saepe, quam blanditiis mollitia optio veniam at odio unde eius pariatur. Deserunt et accusamus quas modi incidunt ipsa. Fugit aliquid iste dolorem mollitia reiciendis labore quos provident at ullam explicabo repellendus eos quae dolorum quisquam ipsa earum quia, culpa laboriosam officiis ut. Odio assumenda ratione est quia tenetur praesentium saepe neque consequatur rem, suscipit tempore impedit dolores perferendis, voluptatem autem recusandae aut reiciendis natus dolorem error voluptas numquam. Accusamus ut qui hic rem.',
			link: 'https://www.youtube.com/embed/5M2RWtD4EzI',
			video: true
		},
		{
			title: 'Title',
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi laudantium odit numquam cum consequuntur quis nihil quod in alias quas vel porro, nemo voluptatum illo unde? Reiciendis corporis necessitatibus cupiditate. Eveniet, dicta iste? Aut suscipit maxime ut vero ad explicabo voluptate, architecto repellat ab. Atque quia neque commodi magnam perspiciatis possimus, quaerat minima optio deserunt quisquam, fuga recusandae quos pariatur illum necessitatibus qui quod velit quasi modi eligendi. Aperiam ad neque voluptas nam nihil ipsa tempora fugiat, soluta, aliquam exercitationem aspernatur ullam deserunt minima non! Possimus nisi quam, explicabo, nam numquam, culpa ad a temporibus amet praesentium quas? Deleniti ab saepe debitis rerum quis, vel distinctio, fuga necessitatibus quisquam iste vero, corporis modi ut nam assumenda cum dolore dolorum esse dicta quasi tempore rem. Esse ea modi commodi animi, eligendi, voluptate, dolorem eaque et iure suscipit eos veniam fugit necessitatibus harum voluptas. Harum omnis unde perferendis suscipit commodi accusamus nulla a labore, esse distinctio consectetur repellat vel similique? Sit nisi ex voluptates sint aut atque, eligendi nam iure provident aliquam nobis amet quae sapiente saepe ullam, asperiores eum fugiat vitae iste. Nostrum labore corporis consectetur, dicta esse odio natus cum rem consequuntur, voluptates, hic nesciunt itaque pariatur enim reprehenderit beatae expedita velit quaerat tempora molestias facere fuga deleniti odit maiores! Amet nihil repellendus molestiae dolores tempora doloremque rerum a voluptas quod numquam earum velit quidem odio exercitationem possimus minus quaerat minima asperiores deleniti, ipsum accusantium ipsam, ducimus tempore. Temporibus rem incidunt architecto voluptas expedita quis praesentium rerum magni illo eius, dolorem doloribus totam fugit placeat, nisi iure doloremque inventore optio laboriosam in saepe obcaecati? Debitis deleniti doloremque similique distinctio incidunt perspiciatis delectus cumque nulla eius optio natus nostrum fugiat laboriosam nam veritatis, iusto et aliquam corporis illum iure officiis. Hic fuga ex laborum? Fuga tenetur iusto a consequuntur? Voluptatem ab tempora perferendis quas enim aliquam corporis tenetur sit, eligendi necessitatibus nostrum, quae hic adipisci ad voluptatibus aut. Repellendus dolorem natus, omnis error cum sapiente ullam asperiores velit saepe, quam blanditiis mollitia optio veniam at odio unde eius pariatur. Deserunt et accusamus quas modi incidunt ipsa. Fugit aliquid iste dolorem mollitia reiciendis labore quos provident at ullam explicabo repellendus eos quae dolorum quisquam ipsa earum quia, culpa laboriosam officiis ut. Odio assumenda ratione est quia tenetur praesentium saepe neque consequatur rem, suscipit tempore impedit dolores perferendis, voluptatem autem recusandae aut reiciendis natus dolorem error voluptas numquam. Accusamus ut qui hic rem.',
			link: 'https://www.youtube.com/embed/gsZiJeaMO48',
			video: true
		},
		{
			title: 'Title',
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi laudantium odit numquam cum consequuntur quis nihil quod in alias quas vel porro, nemo voluptatum illo unde? Reiciendis corporis necessitatibus cupiditate. Eveniet, dicta iste? Aut suscipit maxime ut vero ad explicabo voluptate, architecto repellat ab. Atque quia neque commodi magnam perspiciatis possimus, quaerat minima optio deserunt quisquam, fuga recusandae quos pariatur illum necessitatibus qui quod velit quasi modi eligendi. Aperiam ad neque voluptas nam nihil ipsa tempora fugiat, soluta, aliquam exercitationem aspernatur ullam deserunt minima non! Possimus nisi quam, explicabo, nam numquam, culpa ad a temporibus amet praesentium quas? Deleniti ab saepe debitis rerum quis, vel distinctio, fuga necessitatibus quisquam iste vero, corporis modi ut nam assumenda cum dolore dolorum esse dicta quasi tempore rem. Esse ea modi commodi animi, eligendi, voluptate, dolorem eaque et iure suscipit eos veniam fugit necessitatibus harum voluptas. Harum omnis unde perferendis suscipit commodi accusamus nulla a labore, esse distinctio consectetur repellat vel similique? Sit nisi ex voluptates sint aut atque, eligendi nam iure provident aliquam nobis amet quae sapiente saepe ullam, asperiores eum fugiat vitae iste. Nostrum labore corporis consectetur, dicta esse odio natus cum rem consequuntur, voluptates, hic nesciunt itaque pariatur enim reprehenderit beatae expedita velit quaerat tempora molestias facere fuga deleniti odit maiores! Amet nihil repellendus molestiae dolores tempora doloremque rerum a voluptas quod numquam earum velit quidem odio exercitationem possimus minus quaerat minima asperiores deleniti, ipsum accusantium ipsam, ducimus tempore. Temporibus rem incidunt architecto voluptas expedita quis praesentium rerum magni illo eius, dolorem doloribus totam fugit placeat, nisi iure doloremque inventore optio laboriosam in saepe obcaecati? Debitis deleniti doloremque similique distinctio incidunt perspiciatis delectus cumque nulla eius optio natus nostrum fugiat laboriosam nam veritatis, iusto et aliquam corporis illum iure officiis. Hic fuga ex laborum? Fuga tenetur iusto a consequuntur? Voluptatem ab tempora perferendis quas enim aliquam corporis tenetur sit, eligendi necessitatibus nostrum, quae hic adipisci ad voluptatibus aut. Repellendus dolorem natus, omnis error cum sapiente ullam asperiores velit saepe, quam blanditiis mollitia optio veniam at odio unde eius pariatur. Deserunt et accusamus quas modi incidunt ipsa. Fugit aliquid iste dolorem mollitia reiciendis labore quos provident at ullam explicabo repellendus eos quae dolorum quisquam ipsa earum quia, culpa laboriosam officiis ut. Odio assumenda ratione est quia tenetur praesentium saepe neque consequatur rem, suscipit tempore impedit dolores perferendis, voluptatem autem recusandae aut reiciendis natus dolorem error voluptas numquam. Accusamus ut qui hic rem.',
			link: 'https://www.youtube.com/embed/a-767WnbaCQ',
			video: true
		},
		{
			title: 'Title',
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi laudantium odit numquam cum consequuntur quis nihil quod in alias quas vel porro, nemo voluptatum illo unde? Reiciendis corporis necessitatibus cupiditate. Eveniet, dicta iste? Aut suscipit maxime ut vero ad explicabo voluptate, architecto repellat ab. Atque quia neque commodi magnam perspiciatis possimus, quaerat minima optio deserunt quisquam, fuga recusandae quos pariatur illum necessitatibus qui quod velit quasi modi eligendi. Aperiam ad neque voluptas nam nihil ipsa tempora fugiat, soluta, aliquam exercitationem aspernatur ullam deserunt minima non! Possimus nisi quam, explicabo, nam numquam, culpa ad a temporibus amet praesentium quas? Deleniti ab saepe debitis rerum quis, vel distinctio, fuga necessitatibus quisquam iste vero, corporis modi ut nam assumenda cum dolore dolorum esse dicta quasi tempore rem. Esse ea modi commodi animi, eligendi, voluptate, dolorem eaque et iure suscipit eos veniam fugit necessitatibus harum voluptas. Harum omnis unde perferendis suscipit commodi accusamus nulla a labore, esse distinctio consectetur repellat vel similique? Sit nisi ex voluptates sint aut atque, eligendi nam iure provident aliquam nobis amet quae sapiente saepe ullam, asperiores eum fugiat vitae iste. Nostrum labore corporis consectetur, dicta esse odio natus cum rem consequuntur, voluptates, hic nesciunt itaque pariatur enim reprehenderit beatae expedita velit quaerat tempora molestias facere fuga deleniti odit maiores! Amet nihil repellendus molestiae dolores tempora doloremque rerum a voluptas quod numquam earum velit quidem odio exercitationem possimus minus quaerat minima asperiores deleniti, ipsum accusantium ipsam, ducimus tempore. Temporibus rem incidunt architecto voluptas expedita quis praesentium rerum magni illo eius, dolorem doloribus totam fugit placeat, nisi iure doloremque inventore optio laboriosam in saepe obcaecati? Debitis deleniti doloremque similique distinctio incidunt perspiciatis delectus cumque nulla eius optio natus nostrum fugiat laboriosam nam veritatis, iusto et aliquam corporis illum iure officiis. Hic fuga ex laborum? Fuga tenetur iusto a consequuntur? Voluptatem ab tempora perferendis quas enim aliquam corporis tenetur sit, eligendi necessitatibus nostrum, quae hic adipisci ad voluptatibus aut. Repellendus dolorem natus, omnis error cum sapiente ullam asperiores velit saepe, quam blanditiis mollitia optio veniam at odio unde eius pariatur. Deserunt et accusamus quas modi incidunt ipsa. Fugit aliquid iste dolorem mollitia reiciendis labore quos provident at ullam explicabo repellendus eos quae dolorum quisquam ipsa earum quia, culpa laboriosam officiis ut. Odio assumenda ratione est quia tenetur praesentium saepe neque consequatur rem, suscipit tempore impedit dolores perferendis, voluptatem autem recusandae aut reiciendis natus dolorem error voluptas numquam. Accusamus ut qui hic rem.',
			link: 'https://www.youtube.com/embed/6hVPNONm7xw',
			video: true
		},
		{
			title: 'Title',
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi laudantium odit numquam cum consequuntur quis nihil quod in alias quas vel porro, nemo voluptatum illo unde? Reiciendis corporis necessitatibus cupiditate. Eveniet, dicta iste? Aut suscipit maxime ut vero ad explicabo voluptate, architecto repellat ab. Atque quia neque commodi magnam perspiciatis possimus, quaerat minima optio deserunt quisquam, fuga recusandae quos pariatur illum necessitatibus qui quod velit quasi modi eligendi. Aperiam ad neque voluptas nam nihil ipsa tempora fugiat, soluta, aliquam exercitationem aspernatur ullam deserunt minima non! Possimus nisi quam, explicabo, nam numquam, culpa ad a temporibus amet praesentium quas? Deleniti ab saepe debitis rerum quis, vel distinctio, fuga necessitatibus quisquam iste vero, corporis modi ut nam assumenda cum dolore dolorum esse dicta quasi tempore rem. Esse ea modi commodi animi, eligendi, voluptate, dolorem eaque et iure suscipit eos veniam fugit necessitatibus harum voluptas. Harum omnis unde perferendis suscipit commodi accusamus nulla a labore, esse distinctio consectetur repellat vel similique? Sit nisi ex voluptates sint aut atque, eligendi nam iure provident aliquam nobis amet quae sapiente saepe ullam, asperiores eum fugiat vitae iste. Nostrum labore corporis consectetur, dicta esse odio natus cum rem consequuntur, voluptates, hic nesciunt itaque pariatur enim reprehenderit beatae expedita velit quaerat tempora molestias facere fuga deleniti odit maiores! Amet nihil repellendus molestiae dolores tempora doloremque rerum a voluptas quod numquam earum velit quidem odio exercitationem possimus minus quaerat minima asperiores deleniti, ipsum accusantium ipsam, ducimus tempore. Temporibus rem incidunt architecto voluptas expedita quis praesentium rerum magni illo eius, dolorem doloribus totam fugit placeat, nisi iure doloremque inventore optio laboriosam in saepe obcaecati? Debitis deleniti doloremque similique distinctio incidunt perspiciatis delectus cumque nulla eius optio natus nostrum fugiat laboriosam nam veritatis, iusto et aliquam corporis illum iure officiis. Hic fuga ex laborum? Fuga tenetur iusto a consequuntur? Voluptatem ab tempora perferendis quas enim aliquam corporis tenetur sit, eligendi necessitatibus nostrum, quae hic adipisci ad voluptatibus aut. Repellendus dolorem natus, omnis error cum sapiente ullam asperiores velit saepe, quam blanditiis mollitia optio veniam at odio unde eius pariatur. Deserunt et accusamus quas modi incidunt ipsa. Fugit aliquid iste dolorem mollitia reiciendis labore quos provident at ullam explicabo repellendus eos quae dolorum quisquam ipsa earum quia, culpa laboriosam officiis ut. Odio assumenda ratione est quia tenetur praesentium saepe neque consequatur rem, suscipit tempore impedit dolores perferendis, voluptatem autem recusandae aut reiciendis natus dolorem error voluptas numquam. Accusamus ut qui hic rem.',
			link: 'https://explanaria.github.io/crystalgroups/',
			video: false,
			thumbnail: '/img/winner.webp'
		}
	];

	const dateFormat = {
		month: 'short',
		day: '2-digit',
		hour: 'numeric',
		minute: 'numeric'
	} as const;

	export let data: PageData;
	export let form: ActionData;

	let personalLinkDialog: HTMLDialogElement;
	let email: string;

	function closeDialog() {
		personalLinkDialog.close();
		if (form) {
			form.emailInvalid = undefined;
			form.error = undefined;
			form.success = undefined;
		}
	}
</script>

<svelte:head>
	<title>{COMPETITION_SHORT_NAME}</title>
</svelte:head>

<section class="layout-prose pb-10">
	<p class=" mb-16 text-center text-3xl font-light">Discover and create new math content.</p>
	<p>
		The {COMPETITION_FULL_NAME} ({COMPETITION_SHORT_NAME}) is an annual competition to foster the
		creation of excellent math content online. You can participate as either a creator or judge.
		Five winners will be selected to receive $1,000 and a golden pi creature, and twenty honorable
		mentions will receive $500 each. <a href="#rules">Learn more</a>
	</p>
</section>

<section>
	<h2 class="mb-20 text-5xl font-black text-center">The 5 winners are</h2>

	<div class="custom-grid gap-10">
		{#each winners as winner}
			<div class="flex flex-wrap items-start justify-center gap-10">
				{#if winner.video}
					<iframe
						width="420"
						class="aspect-video rounded-lg"
						src={winner.link}
						title="YouTube video player"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowfullscreen
						loading="lazy"
					/>
				{:else}
					<a href={winner.link} target="_blank" class="inline-block w-[420px]">
						<img
							src={winner.thumbnail}
							alt="Winner thumbnail"
							width="420"
							class="aspect-video rounded-lg"
							loading="lazy"
						/>
					</a>
				{/if}
				<div class="max-w-sm">
					<h3 class="mt-0 mb-2">{winner.title}</h3>
					<p class="line-clamp-5">{winner.description}</p>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- <h2 class="mb-6 text-4xl font-black">Timeline</h2>
	<p>The competition has three phases:</p>
	<ul class="-ml-7 list-outside">
		{#each phases as phase, i}
			<li class={phase.isOpen ? 'marker:text-green-500' : ''}>
				<div class="mb-4 mt-8">
					<span class="flex items-center gap-2 text-xl font-semibold">
						Phase {i + 1}:
						{phase.title}
						{#if phase.isOpen}
							<span class="badge badge-success">current</span>
						{/if}
					</span>
					<span class="text-sm text-gray-500"
						>{#if phase.dates.length > 1}
							From <Time datetime={phase.dates[0]} options={dateFormat} /> to
							<Time datetime={phase.dates[1]} options={dateFormat} />
						{:else}
							Before <Time datetime={phase.dates[0]} options={dateFormat} />
						{/if}</span
					>
				</div>

				<p class="text-sm">{@html phase.description}</p>
				{#if phase.isOpen}
					<p class="mt-6">
						{#if i === 0}
							<a class="btn-primary btn" href="/register"
								>Join in <span class="ml-2 inline-block">&rarr;</span></a
							>
						{:else if i === 1}
							{#if data.token}
								<a class="btn-primary btn" href="/vote/{data.token}">Vote</a>
							{:else}
								<button
									type="button"
									class="btn-outline btn"
									on:click={() => {
										personalLinkDialog.showModal();
									}}
									>Resend me my personal link
								</button>
							{/if}
						{:else if i === 2}
							<a class="btn-primary btn" href="/feedback/{data.token}">See feedbacks</a>
						{/if}
					</p>
				{/if}
			</li>
		{/each}
	</ul>

	{#if !competitionStarted()}
		{#if !PUBLIC_REGISTRATION_START}
			<p>The competition has not started yet.</p>
			<p>Stay tuned for the announcement of phase 1!</p>
		{/if}
	{/if} -->
<!-- </section> -->

<!-- <section class="text-ligh bg-black/95 pb-32 pt-24 text-center" style:color="var(--light-gold)">
	<div class="mx-auto max-w-prose">
		<h2 class="my-0 text-5xl font-black" style:color="var(--light-gold)">
			Last year's competition
		</h2>
		<p class="mt-8 font-light tracking-wider">
			Discover the 5 winners of the last edition. <br />

			The 20 honorable mentions as well as the full list of entries is available
			<a
				class="font-light"
				style:color="var(--light-gold)"
				href="https://www.3blue1brown.com/blog/some2">here</a
			>
		</p>
	</div>
	<div class="mx-4">
		<div
			class="scrollbar mx-auto flex max-w-prose snap-x snap-proximity snap-always items-center gap-10 overflow-x-scroll pb-2"
			style:--scrollbar-thumb="var(--light-gold)"
		>
			{#each winners as winner}
				<div class="snap-center">
					{#if winner.includes('youtube')}
						<iframe
							width="420"
							class="aspect-video rounded-lg"
							src={winner}
							title="YouTube video player"
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							allowfullscreen
							loading="lazy"
						/>
					{:else}
						<a href={winner} target="_blank" class="inline-block w-[420px]">
							<img
								src="/img/winner.webp"
								alt="Winner thumbnail"
								width="420"
								class="aspect-video rounded-lg"
								loading="lazy"
							/>
						</a>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section> -->

<section id="rules" class="layout-prose pt-8">
	<h2 class="mb-16 text-4xl font-black">How it works</h2>

	<details>
		<summary>
			<div class="text-xl font-medium">Is there a topic constraint?</div>
		</summary>
		<p>It has to be about math.</p>
		<p>
			Here we mean &laquo; math &raquo; very broadly, and more applied topics like physics or
			computer science are abundantly welcome. It just has to be the case that a viewer/reader might
			come away knowing something mathematical they didn't before.
		</p>
		<p>
			The topic could be at any level, whether that's basic math for young children or higher-level
			math. If you're assuming a certain background level for the target audience, kindly mention it
			below. It's hard because we don't want to discourage topics with a very niche target audience,
			as those lessons can sometimes be the most valuable. However, if your lesson assumes
			particular expertise, e.g. a comfort with algebraic geometry, keep in mind that our judges may
			not fit into this category. So to actually win the contest, it's helpful if the topic is
			accessible to someone with, say, a background in standard undergrad math topics.
		</p>
	</details>
	<details>
		<summary>
			<div class="text-xl font-medium">How many entries can I submit?</div>
		</summary>
		<p>One entry per person / group</p>
		<p>
			We hope you make more, but we only have the capacity to judge participants based on a single
			entry.
		</p>
	</details>
	<details>
		<summary>
			<div class="text-xl font-medium">Can I use an old entry?</div>
		</summary>
		<p>It has to be something new you make this summer</p>
		<p>
			The spirit of this is to encourage people who've never put stuff online before. If you want to
			work on something you sort of started once before, that's probably fine, but it can't be
			something you already published before this contest. Optimally, you'd use this as a chance to
			try something new you otherwise might not have.
		</p>
	</details>
	<details>
		<summary>
			<div class="text-xl font-medium">When is the registration deadline?</div>
		</summary>
		<p>
			Creators can register until
			<Time datetime={PUBLIC_REGISTRATION_END} />.
		</p>
		<p>
			If you want to participate as a judge you can register at any time, even after the vote has
			open.
		</p>
	</details>
	<details>
		<summary>
			<div class="text-xl font-medium">Does it have to be in English?</div>
		</summary>
		<p>It has to be available in English: subtitles or translation are needed.</p>
		<p>
			If you want to put out an explainer in another language, wonderful! Please do! But the judges
			here will be English speakers, so to be considered for the contest the lesson has to be
			accessible to them.
		</p>
	</details>
	<details>
		<summary>
			<div class="text-xl font-medium">Can I use copyrighted material?</div>
		</summary>
		<p>By registering as a creator you agree to the following copyright notice:</p>
		<p class="indent-8 italic">
			I have permission to use all material contained in my submission for the {COMPETITION_FULL_NAME}.
		</p>
		<ul>
			<li>
				<a href="/content-policy#fair-use">Copyrighted material policy and fair use guidelines</a>
			</li>
			<li><a href="/content-policy#cc">Creative Commons guidelines</a></li>
			<li><a href="/content-policy#ai">AI policy</a></li>
		</ul>

		<p>
			Exception: We have a standing agreement with Desmos that you may use this software in the
			competition.
		</p>
	</details>
	<details>
		<summary>
			<div class="text-xl font-medium">How will winners be selected?</div>
		</summary>
		<p>Here's what we're looking for:</p>
		<ul>
			<li>
				<b> Clarity: </b>
				Jargon should be explained, the goals of the lesson should be understandable with minimal background,
				and the submission should generally display empathy for people unfamiliar with the topic.
			</li>
			<li>
				<b>Motivation:</b> It should be clear to the reader/viewer within the first 30 seconds why they
				should care.
			</li>
			<li>
				<b>Novelty:</b> It doesn't necessarily have to be an original idea or original topic, but it
				should offer someone an experience they might otherwise not have by searching around online.
				Some of the greatest value comes from covering common topics in better ways. Other times there's
				value in surfacing otherwise obscure ideas which more people should know about.
			</li>
			<li>
				<b>Memorability:</b> Something should make the piece easy to remember even several months later.
				Maybe it's the beauty of the presentation, the enthusiasm of the presenter, or the mind-blowingness
				of an aha moment.
			</li>
		</ul>
		<p>
			A peer review process will help filter the better entries. Then the admins will manually
			select the best entries.
		</p>
		<strong>
			If your entry does not respect the rules or copyright notice you will not be eligible to
			accept any prize money.
		</strong>
		<p>
			For longer works, judges might not be able to consume the full video/post. Again, what's hard
			about this is that sometimes great explainers are longer, such as a full lecture and we don't
			want to discourage those. Just understand that to select winners, there is only so much time
			available for review, so the substance of your work should be clearly visible with a 5-10
			minute view.
		</p>
	</details>
</section>

<section class="mt-10 pt-10">
	<h2 class="text-center text-2xl font-light">
		Prizes and operations for this contest have been generously funded by
	</h2>
	<div class="flex justify-center">
		<a href="https://www.janestreet.com/" target="_blank">
			<Icon class="opacity-10" name="janeStreet" width="18rem" height="5rem" />
		</a>
	</div>
</section>

<dialog class="mb-auto" bind:this={personalLinkDialog}>
	<form
		class=""
		method="post"
		action="?/resend_link"
		use:clickOutside={closeDialog}
		use:enhance={({ submitter }) => {
			submitter?.setAttribute('disabled', 'on');
			return async ({ update }) => {
				await update();
				submitter?.removeAttribute('disabled');
			};
		}}
	>
		<h2 class="mt-0">Personal link</h2>
		<p>You will receive an email with your personal link.</p>
		<label for="email" class="label inline-flex gap-4"
			>Email <small class="font-light text-gray-700">(the one you registered with)</small></label
		>
		<input
			id="email"
			type="email"
			name="email"
			placeholder="john@gmail.com"
			class="input-bordered input w-full max-w-xs"
			bind:value={email}
			required
		/>

		<p class="flex gap-4">
			<button type="button" class="btn-outline btn" on:click={closeDialog}>Close</button>
			<button type="submit" class="btn-primary btn">Send email</button>
		</p>
		{#if form?.error || form?.emailInvalid}
			<span class="text-error">Something went wrong.</span>
		{:else if form?.success}
			<span class="text-success">Email sent!</span>
		{/if}
	</form>
</dialog>

<style>
	.custom-grid {
		display: grid;
		grid-template-columns: repeat(minmax(300px 500px), 2);
		justify-content: center;
	}
</style>
