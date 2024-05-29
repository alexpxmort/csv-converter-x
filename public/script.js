document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const delimiterInput = document.getElementById('delimiterInput');
    const messageElement = document.getElementById('message');
    const submitButton = event.target.querySelector('button[type="submit"]');

    if (fileInput.files.length === 0) {
        messageElement.textContent = 'Por favor, selecione um arquivo.';
        return;
    }

    // Desabilitar o botão de envio
    submitButton.disabled = true;
    messageElement.textContent = '';

    const formData = new FormData();
    formData.append('xlsxFile', fileInput.files[0]);
    formData.append('delimiter', delimiterInput.value);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Erro ao converter o arquivo.');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${fileInput.files[0].name?.split('.xlsx')?.[0]}.csv`
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        messageElement.style = 'color:#00ff00'
        messageElement.textContent = 'Arquivo convertido com sucesso!';
    } catch (error) {
        messageElement.textContent = error.message;
    } finally {
        // Habilitar o botão de envio novamente
        setTimeout(()=>{
            submitButton.disabled = false;
        },1000)
    }
});
