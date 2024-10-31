FROM python:alpine

# Enable monospace fonts
RUN apk add font-inconsolata fontconfig
RUN fc-cache -fv

WORKDIR /app

# Install dependencies
RUN apk add firefox geckodriver hugo

COPY requirements.txt requirements.txt
RUN pip install --requirement requirements.txt

# We mount the gokarna source code to avoid rebuilding the image

CMD [ "python", "./screenshot.py" ]
