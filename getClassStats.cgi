#!/usr/bin/python
import MySQLdb as mdb
import sys
import cgi

print "Content-type: text\html\n"
print "{"

form = cgi.FieldStorage()

id = "Lord"
if form.has_key('name'):
   id = form['name'].value

try:

   con = mdb.connect('localhost', 'dlin', 'dlin2dlin', 'dlin')
   sql= "select name, HPCap, StrCap, MagCap, SklCap, SpdCap, LckCap, DefCap, ResCap from FEClasses WHERE name=\"" + id + "\""

   with con:
     cur=con.cursor(mdb.cursors.DictCursor)
     cur.execute(sql)
     row=cur.fetchone()
     print "\"name\":\"" + str(row["name"]) + "\","
     print "\"HPCap\":\"" + str(row["HPCap"]) + "\","
     print "\"StrCap\":\"" + str(row["StrCap"]) + "\","
     print "\"MagCap\":\"" + str(row["MagCap"]) + "\","
     print "\"SklCap\":\"" + str(row["SklCap"]) + "\","
     print "\"SpdCap\":\"" + str(row["SpdCap"]) + "\","
     print "\"LckCap\":\"" + str(row["LckCap"]) + "\","
     print "\"DefCap\":\"" + str(row["DefCap"]) + "\","
     print "\"ResCap\":\"" + str(row["ResCap"]) + "\""
except mdb.Error, e:
   print "Error %d: %s" % (e.args[0],e.args[1])
   sys.exit(1)
finally:    
   if con:    
      con.close()

print "}"
