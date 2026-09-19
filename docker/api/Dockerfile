FROM php:8.3-cli-alpine

# Dependências do sistema necessárias para as extensões PHP e para o Composer
RUN apk add --no-cache \
      git \
      unzip \
      libpq-dev \
      icu-dev \
      oniguruma-dev \
      $PHPIZE_DEPS \
  && docker-php-ext-install pdo pdo_pgsql intl bcmath \
  && apk del $PHPIZE_DEPS

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# O código é montado por volume no docker-compose (desenvolvimento).
# Em build de produção, descomente as linhas abaixo:
# COPY api/ /var/www/html/
# RUN composer install --no-dev --optimize-autoloader

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
