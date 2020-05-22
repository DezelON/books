from django.db import models

class Author(models.Model):

    id = models.AutoField(primary_key=True)
    surname = models.CharField(max_length=20)
    name = models.CharField(max_length=20)
    patronymic = models.CharField(max_length=20, null=True)

    @classmethod
    def create(self, surname: str, name: str, patronymic: str = None):
        author = self(surname=surname, name=name, patronymic=patronymic)
        author.save()
        return author

    @classmethod
    def get(self, **kwargs):
        authors = self.objects.filter(**kwargs)
        if len(authors) > 0:
            return authors[0]
        else:
            return None

    def serialize(self) -> dict:
        return {
            'id': self.id,
            'surname': self.surname,
            'name': self.name,
            'patronymic': self.patronymic
        }

class Book(models.Model):

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=40)
    description = models.TextField()
    price = models.FloatField()
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name="+")

    @classmethod
    def create(self, title: str, description: str, price: float, author: Author):
        book = self(title=title, description=description, price=price, author=author)
        book.save()
        return book

    @classmethod
    def get(self, all: bool = False, **kwargs):
        books = self.objects.filter(**kwargs)
        if len(books) > 0:
            if all:
                return books
            else:
                return books[0]
        else:
            return None

    def serialize(self) -> dict:
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'author': self.author.id
        }