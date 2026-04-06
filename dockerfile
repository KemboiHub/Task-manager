FROM php:8.2-cli

RUN apt-get update && apt-get install -y unzip git curl libzip-dev zip
RUN docker-php-ext-install pdo pdo_mysql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-dev --optimize-autoloader
RUN php artisan config:clear

CMD php artisan serve --host=0.0.0.0 --port=$PORT