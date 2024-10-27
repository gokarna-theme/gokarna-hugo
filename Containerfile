FROM python:alpine

WORKDIR /usr/src/app

# Copy gokarna repo to WORKDIR
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN apk add firefox geckodriver hugo

CMD [ "python", "./screenshot.py" ]
