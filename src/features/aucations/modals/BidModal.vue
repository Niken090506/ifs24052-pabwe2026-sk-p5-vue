<template>
  <div
    v-if="show && aucation"
    data-testid="bid-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
  >
    <div
      class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Coins :size="18" :stroke-width="2.5" />
          </div>
          <h3 class="text-base font-bold text-slate-800">Ajukan Penawaran Lelang</h3>
        </div>
        <button
          type="button"
          data-testid="close-bid-modal-btn"
          aria-label="Tutup modal"
          @click="onClose"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X :size="18" />
        </button>
      </div>

      <!-- Body Form -->
      <form @submit.prevent="handleSave" class="p-6 space-y-4">
        <!-- Item Info Summary -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Barang Lelang
          </p>
          <h4 class="text-sm font-bold text-slate-900 truncate">
            {{ aucation.title }}
          </h4>
          <div class="pt-1 flex items-center justify-between text-xs border-t border-slate-200/60">
            <span class="text-slate-500">Harga Awal:</span>
            <span class="font-bold text-slate-700">{{ formatRupiah(aucation.start_bid) }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-500">Tawaran Tertinggi:</span>
            <span class="font-bold text-emerald-600">{{ formatRupiah(currentHighestBid) }}</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">
            Nominal Tawaran Anda (Rp) <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              type="number"
              data-testid="bid-amount-input"
              v-model="bidAmount"
              :placeholder="`Minimal ${formatRupiah(minBid)}`"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm shadow-xs font-semibold"
              required
            />
          </div>
          <p class="text-[11px] text-slate-500 mt-1.5">
            Nominal penawaran harus lebih tinggi dari penawaran tertinggi saat ini (minimal <strong class="text-emerald-700">{{ formatRupiah(minBid) }}</strong>).
          </p>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            data-testid="cancel-bid-modal-btn"
            @click="onClose"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-bid-modal-btn"
            :disabled="loading"
            class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50"
          >
            <Loader2 v-if="loading" :size="16" class="animate-spin" />
            <Coins v-else :size="16" />
            <span>Kirim Tawaran</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { Coins, X, Loader2 } from "lucide-vue-next";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog, formatRupiah } from "../../../helpers/toolsHelper";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  aucation: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close"]);

const aucationsStore = useAucationsStore();

const bidAmount = ref("");
const loading = ref(false);

const currentHighestBid = computed(() => {
  if (!props.aucation) return 0;
  if (Array.isArray(props.aucation.bids) && props.aucation.bids.length > 0) {
    return Math.max(...props.aucation.bids.map((b) => Number(b.bid || b)));
  }
  return Number(props.aucation.start_bid || 0);
});

const hasExistingBids = computed(() => {
  return Array.isArray(props.aucation?.bids) && props.aucation.bids.length > 0;
});

const minBid = computed(() => {
  if (hasExistingBids.value) {
    return currentHighestBid.value + 1;
  }
  return Number(props.aucation?.start_bid || 1);
});

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      bidAmount.value = "";
    }
  }
);

watch(
  () => [aucationsStore.isBidAdd, aucationsStore.isBidAdded],
  ([isBidAdd, isBidAdded]) => {
    if (isBidAdd) {
      loading.value = false;
      aucationsStore.setIsBidAdd(false);
      if (isBidAdded) {
        aucationsStore.setIsBidAdded(false);
        if (props.aucation?.id) {
          aucationsStore.asyncSetAucation(props.aucation.id);
        }
        aucationsStore.asyncSetAucations();
        onClose();
      }
    }
  }
);

function onClose() {
  emit("close");
}

function handleSave() {
  const amount = Number(bidAmount.value);
  if (!bidAmount.value || isNaN(amount) || amount <= 0) {
    showErrorDialog("Nominal tawaran harus berupa angka lebih dari 0!");
    return;
  }

  if (amount < minBid.value) {
    showErrorDialog(
      `Nominal penawaran harus lebih tinggi dari penawaran saat ini (minimal ${formatRupiah(minBid.value)})!`
    );
    return;
  }

  loading.value = true;
  aucationsStore.asyncSetIsBidAdd(props.aucation.id, amount);
}
</script>
