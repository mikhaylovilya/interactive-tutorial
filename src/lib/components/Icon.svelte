<script lang="ts">
  import { iconPath } from '../utils/icons';

  interface Props {
    name?: string;
    size?: number;
    stroke?: number;
    class?: string;
  }

  let { name = 'info', size = 18, stroke = 1.7, class: className = '' }: Props = $props();
  const paths = $derived(iconPath(name));
</script>

<svg
  class={className}
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={stroke}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false"
>
  {#each paths as d}
    <path {d} />
  {/each}
</svg>
