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
        for delete_id in delete:
            book = Book.get(id=delete_id)
            if book is not None: book.delete()
        for book_update in update:
            book = Book.get(id=book_update['id'])
            if book is not None:
                #TODO: Сделать проврку заполнения реквизитов и возврат обновлённых данных
                book.title = book_update['title']
                book.description = book_update['description']
                book.price = book_update['price']
                book.save()
        for book_add in add:
            pass
            # Book.create(title=book_add['title']) #TODO
    else:
        return HttpResponseRedirect('/')