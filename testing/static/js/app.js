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
    computed: {
        
    },
    methods: {
        fullName: function(author){
            full_name = author.surname + " " + author.name
            if(author.patronymic != undefined){
                full_name += " " + author.patronymic
            }
            return full_name
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
            .then(function (response) {
                console.log(response)
                //TODO
            })
            .catch(function (error) {
                console.log(error);
            });
            this.downloadBooks()
        },
        downloadBooks: function(){
            author_id = this.author_id
            axios.post('/get', {
                data: 'books',
                author_id: author_id
            })
            .then(function (response) {
                books.$data.books = response.data
                books.$data.books.forEach(book => {
                    book.status = ""
                    book.delete = false
                    book.new = false
                    if(book.id>books.$data.last_book_id){
                        books.$data.last_book_id = book.id
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
        updateBook: function(book, type){
            if(type=="update"){
                book_element = document.getElementById('id_'+book.id)
                if(!book_element.classList.contains('warn') && !book_element.classList.contains('error')){
                    book_element.classList.add('warn') //Костыль обработки функции измения класса
                }
                book.status = 'warn'
            }else if(type=="delete"){
                if(book.new){
                    let index = 0
                    let i = 0
                    this.books.forEach(b=>{
                        i++
                        if(b.id == book.id){
                            index = i
                        }
                    })
                    if(index!=0){
                        this.books.splice(index-1, 1)
                    }
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
        .then(function (response) {
            books.$data.authors = response.data
        })
        .catch(function (error) {
            console.log(error);
        });
        this.downloadBooks()
        
        this.created = true
    }
})