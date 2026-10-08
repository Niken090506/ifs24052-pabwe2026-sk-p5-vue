<template>
  <div
    v-if="show && aucation"
    data-testid="edit-aucation-modal"
    class="fixed inset-0 z-50 flex flex-col bg-white animate-in fade-in duration-200 overflow-hidden"
  >
    <!-- Modal Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
          <Edit3 :size="18" :stroke-width="2.5" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-800">Ubah Data Lelang</h3>
          <p class="text-xs text-slate-500">Perbarui rincian informasi dan spesifikasi barang lelang</p>
        </div>
      </div>
      <button
        type="button"
        data-testid="close-edit-modal-btn"
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
              data-testid="edit-aucation-title-input"
              v-model="title"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">
              Harga Penawaran Awal (Rp) <span class="text-red-500">*</span>
            </label>
            <input
              type="number"
              data-testid="edit-aucation-start-bid-input"
              v-model="startBid"
              min="1"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
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
            data-testid="edit-aucation-closed-at-input"
            v-model="closedAt"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
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
              placeholder="Perbarui rincian deskripsi lelang..."
              height="100%"
              textarea-test-id="edit-aucation-description-input"
            />
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/80 shrink-0">
        <button
          type="button"
          data-testid="cancel-edit-modal-btn"
          @click="onClose"
          :disabled="loading"
          class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          data-testid="submit-edit-modal-btn"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-md shadow-amber-600/25 transition-all disabled:opacity-60"
        >
          <template v-if="loading">
            <Loader2 :size="18" class="animate-spin" />
            <span>Menyimpan...</span>
          </template>
          <template v-else>
            <Save :size="18" :stroke-width="2.5" />
            <span>Simpan Perubahan</span>
          </template>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { Edit3, X, Save, Loader2 } from "lucide-vue-next";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import MarkdownEditor from "../components/MarkdownEditor.vue";

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

const loading = ref(false);
const title = ref(props.aucation?.title || "");
const startBid = ref(props.aucation?.start_bid ? String(props.aucation.start_bid) : "");
const closedAt = ref(
  props.aucation?.closed_at ? props.aucation.closed_at.replace(" ", "T").slice(0, 16) : ""
);
const description = ref(props.aucation?.description || "");

function populateForm() {
  if (props.aucation) {
    title.value = props.aucation.title || "";
    startBid.value = props.aucation.start_bid ? String(props.aucation.start_bid) : "";
    if (props.aucation.closed_at) {
      closedAt.value = props.aucation.closed_at.replace(" ", "T").slice(0, 16);
    } else {
      closedAt.value = "";
    }
    description.value = props.aucation.description || "";
  }
}

onMounted(() => {
  populateForm();
});

watch(
  () => props.aucation,
  () => {
    populateForm();
  }
);

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      document.body.style.overflow = "hidden";
      populateForm();
    } else {
      document.body.style.overflow = "auto";
    }
  },
  { immediate: true }
);

watch(
  () => [aucationsStore.isAucationChange, aucationsStore.isAucationChanged],
  ([isAucationChange, isAucationChanged]) => {
    if (isAucationChange) {
      loading.value = false;
      aucationsStore.setIsAucationChange(false);
      if (isAucationChanged) {
        aucationsStore.setIsAucationChanged(false);
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
  aucationsStore.asyncSetIsAucationChange(
    props.aucation.id,
    title.value.trim(),
    description.value.trim(),
    Number(startBid.value),
    formattedDate
  );
}
</script>
