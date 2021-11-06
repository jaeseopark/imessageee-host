tell application "Contacts"
    set {name:personName, image:personImage} to (get my card)
    set filePath to ((("%path%") as text) & personName & ".tif")
    set theFile to open for access file filePath with write permission

    set eof of theFile to 0
    write personImage to theFile
    close access theFile
end tell
