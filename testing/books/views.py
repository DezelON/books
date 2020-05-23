import json

from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from books.models import Author, Book

def books(request):

    data = {

    }

    return render(request, "books/books.html", data)

@csrf_exempt
def get(request):

    if request.method == "POST":
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode) if body_unicode != "" else {}
        data = body.get('data') #Не стал делать условие на отсутствие параметров, ибо всё равно сам пишу данные отправки (хотя стоило бы)
        if data == 'authors':
            authors = Author.objects.all()
            return HttpResponse(json.dumps([author.serialize() for author in authors]))
        elif data == 'books':
            author_id = body.get('author_id')
            author = Author.get(id=author_id)
            books = Book.get(all=True, author = author)
            return HttpResponse(json.dumps([book.serialize() for book in books]))
    else:
        return HttpResponseRedirect('/')

@csrf_exempt
def update(request):

    if request.method == "POST":
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode) if body_unicode != "" else {}
        add = body.get('add') #Также без условия на нахождение
        delete = body.get('delete')
        update = body.get('update')
        author_id = body.get('author_id')
        author = Author.get(id=author_id)
        answer = {
            'deleted': [],
            'added': [],
            'updated': []
        }
        for delete_id in delete:
            book = Book.get(id=delete_id)
            if book is not None:
                book.delete()
                answer['deleted'].append(delete_id)
        for book_update in update:
            book = Book.get(id=book_update['id'])
            if book is not None:
                title = book_update.get('title')
                description = book_update.get('description')
                price = book_update.get('price')
                if title == "" or description == "" or price == "":
                    book_update['status'] = 'error'
                else:
                    book.title = title
                    book.description = description
                    book.price = price
                    book.save()
                    book_update['status'] = ''
                answer['updated'].append(book_update)
        for book_add in add:
            title = book_add.get('title')
            description = book_add.get('description')
            price = book_add.get('price')
            if title == "" or description == "" or price == "":
                book_add['status'] = 'error'
            else:
                book = Book.create(title, description, price, author)
                book_add['status'] = ''
                book_add['new'] = False
                book_add['id'] = book.id
            answer['added'].append(book_add)
        return HttpResponse(json.dumps(answer))
    else:
        return HttpResponseRedirect('/')