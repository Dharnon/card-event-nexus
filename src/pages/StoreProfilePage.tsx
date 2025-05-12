
                  <div className="space-y-2">
                    <h2 className="font-medium">Description</h2>
                    {isEditing ? (
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Store description"
                        rows={4}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {profile?.description || 'No description available'}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="font-medium">Address</h2>
                    {isEditing ? (
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Store address"
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {profile?.address || 'No address available'}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h2 className="font-medium">Phone</h2>
                      {isEditing ? (
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Store phone"
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          {profile?.phone || 'No phone available'}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="font-medium">Website</h2>
                      {isEditing ? (
                        <Input
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="Store website"
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          {profile?.website ? (
                            <a 
                              href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {profile.website}
                            </a>
                          ) : (
                            'No website available'
                          )}
                        </p>
                      )}
                    </div>
                  </div>
