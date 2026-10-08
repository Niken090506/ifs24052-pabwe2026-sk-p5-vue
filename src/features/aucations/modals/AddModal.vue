<template>
  <div
    v-if="show"
    data-testid="add-aucation-modal"
    class="fixed inset-0 z-50 flex flex-col bg-white animate-in fade-in duration-200 overflow-hidden"
  >
    <!-- Modal Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
          <Plus :size="18" :stroke-width="2.5" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-800">Tambah Lelang Baru</h3>
          <p class="text-xs text-slate-500">Buat sesi lelang baru beserta penawaran awal dan batas penutupan</p>
        </div>
      </div>
      <button
        type="button"
        data-testid="close-add-modal-btn"
        aria-label="Tutup modal"
        @click="onClose"
        class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
      >
        <X :size="20" />
      </button>
    </div>

    <!-- Modal Form Body -->
    <form @submit.prevent="handleSave" class="flex-1 flex flex-col min-h-0 bg-white">
      <div class="flex-1 flex flex-col min-h-0 p-6 md:p-8 space-y-4 w-full overflow-y-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">
              Judul Barang Lelang <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              data-testid="add-aucation-title-input"
              v-model="title"
              placeholder="Contoh: Kamera Sony Alpha A7 IV"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">
              Harga Penawaran Awal (Rp) <span class="text-red-500">*</span>
            </label>
            <input
              type="number"
              data-testid="add-aucation-start-bid-input"
              v-model="startBid"
              placeholder="Contoh: 500000"
              min="1"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
              required
            />
          </div>
        </div>

        <div class="shrink-0">
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">
            Batas Waktu Penutupan (Closed At) <span class="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            data-testid="add-aucation-closed-at-input"
            v-model="closedAt"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
            required
          />
        </div>

        <div class="flex-1 flex flex-col min-h-0">
          <label class="block text-sm font-semibold text-slate-700 mb-1.5 shrink-0">
            Deskripsi Barang (Markdown) <span class="text-red-500">*</span>
          </label>
          <div class="flex-1 min-h-[250px]">
            <MarkdownEditor
              v-model="description"
              placeholder="Tuliskan spesifikasi, kelengkapan, dan kondisi barang lelang dalam format Markdown..."
              height="100%"
              textarea-test-id="add-aucation-description-input"
            />
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/80 shrink-0">
        <button
          type="button"
          data-testid="cancel-add-modal-btn"
          @click="onClose"
          :disabled="loading"
          class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          data-testid="submit-add-modal-btn"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
        >
          <template v-if="loading">
            <Loader2 :size="18" class="animate-spin" />
            <span>Menyimpan...</span>
          </template>
          <template v-else>
            <Plus :size="18" :stroke-width="2.5" />
            <span>Tambah Lelang</span>
          </template>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { Plus, X, Loader2 } from "lucide-vue-next";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import MarkdownEditor from "../components/MarkdownEditor.vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const aucationsStore = useAucationsStore();

const loading = ref(false);
const title = ref("");
const startBid = ref("");
const closedAt = ref("");
const description = ref("");

function onClose() {
  emit("close");
}

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  },
  { immediate: true }
);

watch(
  () => [aucationsStore.isAucationAdd, aucationsStore.isAucationAdded],
  ([isAucationAdd, isAucationAdded]) => {
    if (isAucationAdd) {
      loading.value = false;
      aucationsStore.setIsAucationAdd(false);
      if (isAucationAdded) {
        aucationsStore.setIsAucationAdded(false);
        aucationsStore.asyncSetAucations();
        title.value = "";
        startBid.value = "";
        closedAt.value = "";
        description.value = "";
        onClose();
      }
    }
  }
);

function handleSave() {
  if (!title.value.trim()) {
    showErrorDialog("Judul tidak boleh kosong");
    return;
  }

  if (!startBid.value || Number(startBid.value) <= 0) {
    showErrorDialog("Harga penawaran awal harus lebih dari 0");
    return;
  }

  if (!closedAt.value) {
    showErrorDialog("Batas waktu penutupan lelang harus diisi");
    return;
  }

  if (!description.value.trim()) {
    showErrorDialog("Deskripsi tidak boleh kosong");
    return;
  }

  let formattedDate = closedAt.value.trim().replace("T", " ");
  if (formattedDate.length === 16) {
    formattedDate += ":00";
  }

  loading.value = true;
  aucationsStore.asyncSetIsAucationAdd(
    title.value.trim(),
    description.value.trim(),
    Number(startBid.value),
    formattedDate
  );
}
</script>
