#!/usr/bin/python
import urlparse
import urllib2, urllib
import json
import cgi, cgitb; cgitb.enable()
from xml.dom import minidom

print "Content-type: text/html\n"

url="http://en.wikipedia.org/w/api.php?action=opensearch&limit=10&namespace=0&format=json&search="
form = cgi.FieldStorage()
k=5

q = ""
if form.has_key('q'):
	q = form['q'].value

if form.has_key('k'):
	k = int(form['k'].value)
if form.has_key('c'):
	q +="category=true"

q = urllib.quote(q)


print '{\"source\":\"Wikipedia\", \"Query\":\"'+ q +'\", '
print '\"QueryExpand\":['

try:
	file = urllib2.urlopen(url+q)
	data = file.read()
	jsondata=json.loads(data)
    
	k=min(k, len(jsondata[1]))
	for i in range (0, k-1):
		try:
			print '{\"term\":\"' + jsondata[1][i] +'\", \"freq\":\"100\"},'
		except:
			print ''
	try:
			print '{\"term\":\"' + jsondata[1][k-1] +'\", \"freq\":\"100\"}'
	except:
		print ''
	print ']}'
except:
    print ']}'
