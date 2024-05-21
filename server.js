const Hapi = require('@hapi/hapi');

const init = async () => {
    const server = Hapi.server({
        port: 9000,
        host: 'localhost'
    });

    // Data buku
    let books = [];

    // Route untuk menyimpan buku
    server.route({
        method: 'POST',
        path: '/books',
        handler: (request, h) => {
            const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

            // Memastikan properti name terlampir pada request body
            if (!name) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal menambahkan buku. Mohon isi nama buku'
                }).code(400);
            }

            // Memastikan nilai properti readPage tidak lebih besar dari nilai properti pageCount
            if (readPage > pageCount) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
                }).code(400);
            }

            // Membuat objek buku dengan ID unik
            const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            const newBook = {
                id,
                name,
                year,
                author,
                summary,
                publisher,
                pageCount,
                readPage,
                finished: pageCount === readPage,
                reading,
                insertedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Menyimpan buku ke dalam data buku
            books.push(newBook);

            // Mengembalikan respons sukses
            return h.response({
                status: 'success',
                message: 'Buku berhasil ditambahkan',
                data: {
                    bookId: id
                }
            }).code(201);
        }
    });

    // Route untuk menampilkan seluruh buku
    server.route({
        method: 'GET',
        path: '/books',
        handler: (request, h) => {
            let filteredBooks = [...books];

            // Filter berdasarkan query parameter ?name
            if (request.query.name) {
                filteredBooks = filteredBooks.filter(book =>
                    book.name.toLowerCase().includes(request.query.name.toLowerCase())
                );
            }

            // Filter berdasarkan query parameter ?reading
            if (request.query.reading !== undefined) {
                const readingValue = parseInt(request.query.reading, 10);
                filteredBooks = filteredBooks.filter(book =>
                    readingValue ? book.reading : !book.reading
                );
            }

            // Filter berdasarkan query parameter ?finished
            if (request.query.finished !== undefined) {
                const finishedValue = parseInt(request.query.finished, 10);
                filteredBooks = filteredBooks.filter(book =>
                    finishedValue ? book.finished : !book.finished
                );
            }

            // Memeriksa apakah ada buku yang tersimpan
            if (filteredBooks.length === 0) {
                return h.response({
                    status: 'success',
                    data: {
                        books: []
                    }
                }).code(200);
            }

            // Jika ada buku tersimpan, kirim daftar buku sebagai respons
            return h.response({
                status: 'success',
                data: {
                    books: filteredBooks.map(book => ({
                        id: book.id,
                        name: book.name,
                        publisher: book.publisher
                    }))
                }
            }).code(200);
        }
    });

    // Route untuk menampilkan data buku berdasarkan bookId
    server.route({
        method: 'GET',
        path: '/books/{bookId}',
        handler: (request, h) => {
            // Mendapatkan bookId dari URL
            const { bookId } = request.params;

            // Mencari buku dengan bookId yang sesuai
            const book = books.find(book => book.id === bookId);

            // Jika tidak ditemukan, kirim respons dengan status 404
            if (!book) {
                return h.response({
                    status: 'fail',
                    message: 'Buku tidak ditemukan'
                }).code(404);
            }

            // Jika buku ditemukan, kirim respons dengan status 200 dan detail buku
            return h.response({
                status: 'success',
                data: {
                    book
                }
            }).code(200);
        }
    });

    // Route untuk mengubah data buku berdasarkan bookId
    server.route({
        method: 'PUT',
        path: '/books/{bookId}',
        handler: (request, h) => {
            // Mendapatkan bookId dari URL
            const { bookId } = request.params;

            // Mencari index buku dengan bookId yang sesuai
            const bookIndex = books.findIndex(book => book.id === bookId);

            // Jika buku tidak ditemukan, kirim respons dengan status 404
            if (bookIndex === -1) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. Id tidak ditemukan'
                }).code(404);
            }

            // Mendapatkan data buku yang akan diubah dari body request
            const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

            // Memastikan properti name terlampir pada request body
            if (!name) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. Mohon isi nama buku'
                }).code(400);
            }

            // Memastikan nilai properti readPage tidak lebih besar dari nilai properti pageCount
            if (readPage > pageCount) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
                }).code(400);
            }

            // Mengupdate data buku
            books[bookIndex] = {
                ...books[bookIndex],
                name,
                year,
                author,
                summary,
                publisher,
                pageCount,
                readPage,
                finished: pageCount === readPage,
                reading,
                updatedAt: new Date().toISOString()
            };

            // Mengembalikan respons sukses
            return h.response({
                status: 'success',
                message: 'Buku berhasil diperbarui'
            }).code(200);
        }
    });

    // Route untuk menghapus buku berdasarkan bookId
    server.route({
        method: 'DELETE',
        path: '/books/{bookId}',
        handler: (request, h) => {
            // Mendapatkan bookId dari URL
            const { bookId } = request.params;

            // Mencari index buku dengan bookId yang sesuai
            const bookIndex = books.findIndex(book => book.id === bookId);

            // Jika buku tidak ditemukan, kirim respons dengan status 404
            if (bookIndex === -1) {
                return h.response({
                    status: 'fail',
                    message: 'Buku gagal dihapus. Id tidak ditemukan'
                }).code(404);
            }

            // Menghapus buku dari daftar buku
            books.splice(bookIndex, 1);

            // Mengembalikan respons sukses
            return h.response({
                status: 'success',
                message: 'Buku berhasil dihapus'
            }).code(200);
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
