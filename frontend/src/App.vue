<template>
  <div class="container">
    <h2>AWS Rekognition Image Analysis</h2>

    <input type="file" @change="handleFile" accept="image/*" />
    <br /><br />

    <button @click="uploadImage" :disabled="!file || loading">
      {{ loading ? "Processing..." : "Upload & Analyze" }}
    </button>

    <div v-if="preview">
      <h3>Preview</h3>
      <img :src="preview" class="preview" />
    </div>

    <div v-if="labels.length">
      <h3>Detection Result</h3>
      <table>
        <tr>
          <th>Label</th>
          <th>Confidence</th>
        </tr>
        <tr v-for="(label, index) in labels" :key="index">
          <td>{{ label.Name }}</td>
          <td>{{ label.Confidence.toFixed(2) }}%</td>
        </tr>
      </table>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      file: null,
      preview: null,
      labels: [],
      loading: false,
      error: "",

      // Penting: relative path (jangan pakai http:// atau IP)
      apiUrl: "/api/upload"
    };
  },

  methods: {
    handleFile(event) {
      this.file = event.target.files[0];
      this.labels = [];
      this.error = "";

      if (this.file) {
        this.preview = URL.createObjectURL(this.file);
      }
    },

    async uploadImage() {
      if (!this.file) return;

      const formData = new FormData();
      formData.append("image", this.file);

      this.loading = true;
      this.error = "";
      this.labels = [];

      try {
        const response = await fetch(this.apiUrl, {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }

        const data = await response.json();
        this.labels = data.labels || [];

      } catch (err) {
        console.error("Fetch error:", err);
        this.error = "Failed to connect to backend";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 700px;
  margin: 40px auto;
  font-family: Arial, sans-serif;
  background: white;
  padding: 20px;
  border-radius: 6px;
}

.preview {
  max-width: 300px;
  margin-top: 10px;
  border: 1px solid #ccc;
}

button {
  padding: 8px 16px;
  cursor: pointer;
}

table {
  margin-top: 10px;
  border-collapse: collapse;
  width: 100%;
}

table, th, td {
  border: 1px solid #ccc;
}

th, td {
  padding: 6px;
  text-align: left;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
