<template>
    <div id="app">
        <input type="file" @change="FileChange" />
        <el-button @click="handleUpload">上传</el-button>
    </div>
</template>
<script>
import request from './utils/request';
const SIZE = 1024 * 1024 * 2;
export default {
    data() {
        return {
            container: {
                file: null,
            },
            data: [],
        };
    },
    methods: {
        FileChange(e) {
            // console.log(e.target.files);
            const [file] = e.target.files;
            console.log(file);
            if (file) {
                this.container.file = file;
            }
        },
        //分片
        createFileChunk(file, size = SIZE) {
            const fileChunkList = [];
            let cur = 0;
            while (cur < file.size) {
                fileChunkList.push({ file: file.slice(cur, cur + size) });
                cur += size;
            }
            return fileChunkList;
        },
        //上传
        async uploadChunk() {
            let requestList = this.data
                .map(({ chunk, hash }) => {
                    const formData = new FormData();
                    formData.append('chunk', chunk);
                    formData.append('hash', hash);
                    formData.append('filename', this.container.file.name);
                    return { formData };
                })
                .map(async ({ formData }) =>
                    request({
                        url: 'http://localhost:3000',
                        data: formData,
                    })
                );
            await Promise.all(requestList);
        },

        //点击上传
        async handleUpload() {
            if (!this.container.file) return;
            let formData = new FormData();
            formData.append('filename', this.container.file.name);

            const fileChunkList = this.createFileChunk(this.container.file);
            this.data = fileChunkList.map(({ file }, index) => ({
                chunk: file,
                hash: this.container.file.name + '-' + index,
            }));
            this.uploadChunk();
        },
    },
};
</script>

<style lang="scss">
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}
</style>
