<template>
  <section :class="$style.informationPage">
    <font-awesome
      v-if="isLoading"
      :class="$style.spinner"
      icon="spinner"
      spin/>
    <div :id="gdocElementId" />
    <a
      :href="editLink"
      :class="$style.editLink">Redigera</a>
  </section>
</template>
<script>
import googleDrive from '../api/googleDrive';

const editLink =
  'https://docs.google.com/document/d/1TRE1P4EmB3kwlURit8lICniBtRp7aqnhcU8x7D6yzqI/edit#';

export default {
  name: 'InformationPage',
  data() {
    return {
      isLoading: true,
      gdocElementId: 'gdoc',
      editLink
    };
  },
  mounted() {
    googleDrive.init();
    googleDrive
      .printInfoDoc(this.gdocElementId)
      .then(() => (this.isLoading = false))
      .catch(() => (this.isLoading = false));
  }
};
</script>
<style module>
.informationPage {
  height: 100%;
  padding: 1em;
  position: relative;
}
.editLink {
  color: whitesmoke;
  font-size: smaller;
  position: absolute;
  bottom: 1em;
  left: 1em;
}
.spinner {
  font-size: 5vw;
  position: absolute;
  left: calc(50% - 2.5vw);
  top: calc(50% - 2.5vw);
}
</style>
