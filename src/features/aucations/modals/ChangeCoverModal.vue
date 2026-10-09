<template>
  <div
    v-if="show && aucation"
    data-testid="change-cover-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
  >
    <div
      class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
      @click.stop
    >
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <ImagePlus :size="18" :stroke-width="2.5" />
          </div>
          <h3 class="text-base font-bold text-slate-800">Ubah Cover Lelang</h3>
        </div>
        <button
          type="button"
          data-testid="close-cover-modal-btn"
          aria-label="Tutup modal"
          @click="onClose"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X :size="18" />
        </button>
      </div>

      <form @submit.prevent="handleSave" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            Pilih Gambar Cover
          </label>
          <label class="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all overflow-hidden relative">
            <img
              v-if="previewUrl"
              data-testid="cover-preview-img"
              :src="previewUrl"
              alt="Preview"
              width="400"
              height="192"
              class="w-full h-full object-cover"
            />
            <div v-else class="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <div class="w-10 h-10 mb-2 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Upload :size="20" />
              </div>
              <p class="text-sm font-semibold text-slate-700">
                Klik untuk memilih foto cover
              </p>
              <p class="text-xs text-slate-500 mt-1">PNG, JPG, JPEG (Maks. 2MB)</p>
            </div>
            <input
              type="file"
              id="cover-file-input"
              data-testid="cover-file-input"
              aria-label="Pilih Gambar Cover"
              accept="image/*"
              @change="handleFileChange"
              class="hidden"
            />
          </label>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            data-testid="cancel-cover-modal-btn"
            @click="onClose"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-cover-modal-btn"
            :disabled="loading || !file"
            class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            <Loader2 v-if="loading" :size="16" class="animate-spin" />
            <Save v-else :size="16" />
            <span>Simpan Cover</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { ImagePlus, X, Upload, Save, Loader2 } from "lucide-vue-next";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

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

const file = ref(null);
const previewUrl = ref(props.aucation?.cover || null);
const loading = ref(false);

watch(
  () => [props.show, props.aucation],
  ([newShow, newAucation]) => {
    if (newShow) {
      previewUrl.value = newAucation?.cover || null;
      file.value = null;
    }
  },
  { immediate: true }
);

watch(
  () => [aucationsStore.isAucationChangeCover, aucationsStore.isAucationChangedCover],
  ([isChangeCover, isChangedCover]) => {
    if (isChangeCover) {
      loading.value = false;
      aucationsStore.setIsAucationChangeCover(false);
      if (isChangedCover) {
        aucationsStore.setIsAucationChangedCover(false);
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

function handleFileChange(e) {
  const selected = e.target.files?.[0];
  if (!selected) return;

  if (!selected.type.startsWith("image/")) {
    showErrorDialog("Format file harus berupa gambar!");
    return;
  }

  if (selected.size > 2 * 1024 * 1024) {
    showErrorDialog("Ukuran file cover maksimal 2MB!");
    return;
  }

  file.value = selected;
  previewUrl.value = URL.createObjectURL(selected);
}

function handleSave() {
  if (!file.value) {
    showErrorDialog("Silakan pilih file gambar cover!");
    return;
  }

  loading.value = true;
  aucationsStore.asyncSetIsAucationChangeCover(props.aucation.id, file.value);
}
</script>
