const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = 3000;
const methodOverride = require('method-override');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const url = "mongodb://localhost:27017";
const dbName = 'livraria';
const collectionName = 'livros';

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/cadastro', (req, res) => {
    res.sendFile(__dirname + '/cadastro.html');
});



app.post('/cadastro', async (req, res) => {
    const novoLivro = req.body;

    const client = new MongoClient(url);

    try {
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const result = await collection.insertOne(novoLivro);
        console.log(`Livro cadastrado com sucesso. ID: ${result.insertedId}`);

        res.redirect('/');
    } catch (err) {
        console.error('Erro ao cadastrar o livro:', err);
        res.status(500).send('Erro ao cadastrar o livro. Por favor, tente novamente mais tarde.');
    } finally {
        client.close();
    }
});


app.get('/livros', async (req, res) => {
    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName)

        const livros = await collection.find({}, { projection: { _id: 1, titulo: 1, autor: 1, editora: 1 } }).toArray();
        res.json(livros);
    } catch (err) {
        console.error('Erro ao buscar livros:', err);
        res.status(500).send('Erro ao buscar livros. Por favor, tente novamente mais tarde.');
    } finally {
        client.close();
    }
});

app.get('/atualizar', async (req, res) => {
    res.sendFile(__dirname + '/atualizar.html');
});

app.post('/atualizar', async (req, res) => {
    const { id, titulo, autor, ano_publicacao, genero, editora, paginas, idioma, ISBN, disponivel } = req.body;

    const client = new MongoClient(url);

    try {
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    titulo, autor, ano_publicacao, genero, editora, paginas, idioma, ISBN, disponivel: disponivel === "true"
                }
            }
        );
        if (result.modifiedCount > 0) {
            console.log(`livro com ID: ${id} atualizado com sucesso`);
            res.redirect('/');
        } else {
            res.status(404).send('Livro não encontrado');
        }

    } catch (err) {
        console.log('Erro ao atualizar o livro:', err);
        res.status(500).send('Erro ao atualizar o livro. Por favor, tente novamente mais tarde  ');
    } finally {
        client.close();
    }
});

app.get('/livro/:id', async (req, res) => {
    const { id } = req.params;

    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const livro = await collection.findOne({ _id: new ObjectId(id) });
        if (livro) {
            return res.status(404).send('Livro não encontrado');
        }

        res.json(livros);

    } catch (err) {
        console.log('Erro ao buscar o livro:', err);
        res.status(500).send('Erro ao buscar livro. Por favor, tente novamente mais tarde.');
    } finally {
        client.close();
    }


});


app.post('/deletar', async (req, res) => {
    const { id } = req.body;

    const cliet = new MongoClient(url);

    try {
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const result = await collectionndeleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount > 0) {
            console.log(`livro com id ${id} deletando com sucesso.`);
            res.redirect('/');
        } else {
            res.status(404).send('Livro não encontrato.');
        }

    } catch (err) {
        console.log('Erros ao delear o livro', err);
        res.status(500).send('Erro ao deletar o livro.Por favor, tente novamente mais tarde.');
    } finally {
        client.close()
    }


});


app.listen(port, () => {
    console.log(`Servidor Node.js em execução em http://localhost:${port}`);

});