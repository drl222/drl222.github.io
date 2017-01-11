#!/usr/bin/python
import MySQLdb as mdb
import sys
import cgi

print "Content-type: text\html\n"
print "{"

form = cgi.FieldStorage()

id = "1"
if form.has_key('id'):
   id = form['id'].value

try:

   con = mdb.connect('localhost', 'dlin', 'dlin2dlin', 'dlin')
   sql= "select name, HPGrowth, StrGrowth, MagGrowth, SklGrowth, SpdGrowth, LckGrowth, DefGrowth, ResGrowth from CharacterGrowths WHERE id=" + id

   with con:
     cur=con.cursor(mdb.cursors.DictCursor)
     cur.execute(sql)
     row=cur.fetchone()
     print "\"name\":\"" + str(row["name"]) + "\","
     print "\"HPGrowth\":\"" + str(row["HPGrowth"]) + "\","
     print "\"StrGrowth\":\"" + str(row["StrGrowth"]) + "\","
     print "\"MagGrowth\":\"" + str(row["MagGrowth"]) + "\","
     print "\"SklGrowth\":\"" + str(row["SklGrowth"]) + "\","
     print "\"SpdGrowth\":\"" + str(row["SpdGrowth"]) + "\","
     print "\"LckGrowth\":\"" + str(row["LckGrowth"]) + "\","
     print "\"DefGrowth\":\"" + str(row["DefGrowth"]) + "\","
     print "\"ResGrowth\":\"" + str(row["ResGrowth"]) + "\""
except mdb.Error, e:
   print "Error %d: %s" % (e.args[0],e.args[1])
   sys.exit(1)
finally:    
   if con:    
      con.close()

print "}"
