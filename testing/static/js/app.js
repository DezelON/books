var books = new Vue({
    el: '#books',
    delimiters: ["${", "}"],
    data: {
        authors: [],
        author_id: 1,
        last_book_id: 0,
        books: [],
        updates: {
            delete: [],
            add: [],
            update: []
        },
        created: false
    },
    methods: {
        fullName: function(author){
            full_name = author.surname + " " + author.name
            if(author.patronymic != undefined){
                full_name += " " + author.patronymic
            }
            return full_name
        },
        getBookIndex: function(id){
            let index = -1
            let i = -1
            this.books.forEach(book=>{
                i++
                if(book.id == id){
                    index = i
                }
            })
            return index
        },
        updateAll: function(){
            this.books.forEach(book =>{
                if(book.new){
                    this.updates.add.push(book)
                }else if(book.delete){
                    this.updates.delete.push(book.id)
                }else if(book.status!=""){
                    this.updates.update.push(book)
                }
            })
            axios.post('/update', {
                add: this.updates.add,
                delete: this.updates.delete,
                update: this.updates.update,
                author_id: this.author_id
            })
            .then(response => {
                data = response.data
                console.log(data)
                data.deleted.forEach(book_id=>{
                    this.deleteBook(book_id)
                })
                data.updated.forEach(update_book=>{
                    let i = this.getBookIndex(update_book.id)
                    if(i!=-1){
                        this.books[i].title = update_book.title
                        this.books[i].description = update_book.description
                        this.books[i].price = update_book.price

                        this.books[i].status = update_book.status
                        this.books[i].delete = update_book.delete
                        this.books[i].new = update_book.new

                        this.updateStyleBook(this.books[i].id, this.books[i].status)
                    }
                })
                data.added.forEach(add_book=>{
                    let i = this.getBookIndex(add_book.id)
                    if(i!=-1){
                        this.books[i].title = add_book.title
                        this.books[i].description = add_book.description
                        this.books[i].price = add_book.price

                        this.books[i].status = add_book.status
                        this.books[i].delete = add_book.delete
                        this.books[i].new = add_book.new
                        
                        this.updateStyleBook(this.books[i].id, this.books[i].status)
                    }
                })
                this.updates = {
                    delete: [],
                    add: [],
                    update: []
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        },
        downloadBooks: function(){
            author_id = this.author_id
            axios.post('/get', {
                data: 'books',
                author_id: author_id
            })
            .then(response => {
                this.books = response.data
                this.books.forEach(book => {
                    book.status = ""
                    book.delete = false
                    book.new = false
                    if(book.id>this.last_book_id){
                        this.last_book_id = book.id
                    }
                })
            })
            .catch(function (error) {
                console.log(error);
            });
            this.updates = {
                delete: [],
                add: [],
                update: []
            }
        },
        addBook: function(){
            this.last_book_id += 1
            book = {
                new: true,
                delete: false,
                status: 'warn',
                id: this.last_book_id,
                author: this.author_id,
                title: "",
                description: "",
                price: ""
            }
            this.books.push(book)
        },
        deleteBook: function(id){
            let index = -1
            let i = -1
            this.books.forEach(b=>{
                i++
                if(b.id == id){
                    index = i
                }
            })
            if(index!=-1){
                this.books.splice(index, 1)
            }
        },
        updateStyleBook: function(id, style){//Костыль обработки функции измения класса из-за задержки в изменении
            book_element = document.getElementById('id_'+id)
            if(book_element.classList.contains('warn')){
                book_element.classList.remove('warn')
            }
            if(book_element.classList.contains('error')){
                book_element.classList.remove('error')
            }
            if(style!="")
                book_element.classList.add(style) 
        },
        updateBook: function(book, type){
            if(type=="update"){
                this.updateStyleBook(book.id, 'warn')
                book.status = 'warn'
            }else if(type=="delete"){
                if(book.new){
                    this.deleteBook(book.id)
                }else{
                    book_element = document.getElementById('id_'+book.id)
                    if(book.delete){
                        book.delete = false
                        if(book_element.lastChild.classList.contains('delete')){
                            book_element.lastChild.classList.remove('delete') //Костыль обработки функции измения класса
                        }
                    }else{
                        book.delete = true
                        if(!book_element.lastChild.classList.contains('delete')){
                            book_element.lastChild.classList.add('delete') //Костыль обработки функции измения класса
                        }
                    }
                }
            }
        }
    },
    created: function(){
        axios.post('/get', {
            data: 'authors'
        })
        .then(response => {
            this.authors = response.data
        })
        .catch(function (error) {
            console.log(error);
        });
        this.downloadBooks()
        
        this.created = true
    }
})