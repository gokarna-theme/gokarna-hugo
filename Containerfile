FROM python:alpine

WORKDIR /usr/src/app
# Copy gokarna repo to WORKDIR
COPY . .

# Enable monospace fonts
RUN apk add font-inconsolata fontconfig
RUN fc-cache -fv

# Install dependencies
RUN pip install --requirement requirements.txt
RUN apk add firefox geckodriver hugo

CMD [ "python", "./screenshot.py" ]
